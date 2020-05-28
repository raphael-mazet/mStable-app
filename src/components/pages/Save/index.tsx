import React, {
  ComponentProps,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { formatUnits, parseUnits } from 'ethers/utils';
import { useWallet } from 'use-wallet';
import Skeleton from 'react-loading-skeleton';
import { Form, FormRow, SubmitButton } from '../../core/Form';
import { TokenAmountInput } from '../../forms/TokenAmountInput';
import { Reasons, TransactionType, useSaveState } from './state';
import {
  useMusdData,
  useMUSDSavings,
} from '../../../context/DataProvider/DataProvider';
import { useTokenWithBalance } from '../../../context/DataProvider/TokensProvider';
import { Interfaces, SendTxManifest } from '../../../types';
import { H3, P } from '../../core/Typography';
import { CountUp } from '../../core/CountUp';
import { MUSDIconTransparent } from '../../icons/TokenIcon';
import { FontSize, Size, Color } from '../../../theme';
import { useSendTransaction } from '../../../context/TransactionsProvider';
import {
  useMusdContract,
  useSavingsContract,
} from '../../../context/DataProvider/ContractsProvider';
import { TransactionDetailsDropdown } from '../../forms/TransactionDetailsDropdown';
import { ToggleInput } from '../../forms/ToggleInput';
import { formatExactAmount } from '../../../web3/amounts';
import {
  useApy,
  useIncreasingNumber,
  useSavingsBalance,
} from '../../../web3/hooks';

const mapReasonToMessage = (reason: Reasons): string => {
  switch (reason) {
    case Reasons.FetchingData:
      return 'Fetching data';
    case Reasons.AmountMustBeSet:
      return 'Amount must be set';
    case Reasons.AmountMustBeGreaterThanZero:
      return 'Amount must be greater than zero';
    case Reasons.DepositAmountMustNotExceedTokenBalance:
      return 'Deposit amount must not exceed token balance';
    case Reasons.TokenMustBeSelected:
      return 'Token must be selected';
    case Reasons.WithdrawAmountMustNotExceedSavingsBalance:
      return 'Withdraw amount must not exceed savings balance';
    case Reasons.MUSDMustBeUnlocked:
      return 'mUSD must be unlocked first';
    default:
      throw new Error('Unhandled reason');
  }
};

const CreditBalance = styled.div`
  line-height: 4em;

  img {
    width: 6vw;
    margin-right: 10px;
  }

  span {
    font-weight: bold;
    font-size: 6vw;
  }

  @media (min-width: ${({ theme }) => theme.viewportWidth.s}) {
    span {
      font-size: 3.5vw;
    }

    img {
      width: 2.5vw;
    }
  }
`;

const InfoCountUp = styled(CountUp)`
  font-size: ${FontSize.xl};
`;

const InfoRow = styled.div`
  text-align: center;
  width: 100%;

  h3 {
    padding-bottom: 10px;
  }

  > div {
    padding: 10px 0 20px 0;
  }

  @media (min-width: ${({ theme }) => theme.viewportWidth.m}) {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      border-top: none;
    }

    > div {
      flex-grow: 1;
    }
  }

  ${({ theme }) => theme.mixins.borderTop}
`;

const TransactionTypeRow = styled(FormRow)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.l} 0`};

  > * {
    padding: 0 8px;
  }
`;

/**
 * Savings form component
 *
 */
export const Save: FC<{}> = () => {
  const [
    { transactionType, input, error },
    { setError, setToken, setTransactionType, setQuantity },
  ] = useSaveState();

  const {
    token: { address: inputAddress },
    amount: { exact: inputAmount },
    amountInCredits,
  } = input;

  const errorMessage = useMemo(
    () => (error === null ? undefined : mapReasonToMessage(error)),
    [error],
  );

  /**
   * Ref for tracking if the form inputs were touched
   */
  const touched = useRef<boolean>(false);

  const { account } = useWallet();

  const sendTransaction = useSendTransaction();

  const savingsContract = useSavingsContract();
  const savingsContractAddress = savingsContract?.address || null;

  const mUsdContract = useMusdContract();
  const mUsd = useMusdData();
  const mUsdAddress = mUsd?.token.address || null;

  const mUsdToken = useTokenWithBalance(mUsdAddress);
  const mUsdSavings = useMUSDSavings();

  const savingsBalance = useSavingsBalance(account);

  const musdBalanceItem = useMemo(
    () => [
      {
        label: 'Balance',
        value: formatExactAmount(
          mUsd.token.balance,
          mUsd.token.decimals,
          mUsd.token.symbol,
          true,
        ),
      },
    ],
    [mUsd.token.balance, mUsd.token.decimals, mUsd.token.symbol],
  );

  const apy = useApy();

  const apyPercentage = useMemo<number | null>(
    () => (apy ? parseFloat(formatUnits(apy, 16)) : null),
    [apy],
  );

  const savingsBalanceIncreasing = useIncreasingNumber(
    savingsBalance.simple,
    // Calculate the increase per 100ms for this APY
    savingsBalance.simple && apyPercentage
      ? (savingsBalance.simple * apyPercentage) / 100 / 365 / 24 / 60 / 60 / 10
      : 0.0000001,
    100,
  );

  const tokenAddresses = useMemo<string[]>(
    () => (mUsdAddress ? [mUsdAddress] : []),
    [mUsdAddress],
  );

  const needsUnlock = useMemo<boolean>(
    () =>
      !!(
        transactionType === TransactionType.Deposit &&
        inputAmount &&
        mUsdSavings?.allowance?.lt(inputAmount)
      ),
    [transactionType, inputAmount, mUsdSavings],
  );

  // Set initial values and `touched` ref
  useEffect(() => {
    if (touched.current) return;

    if (inputAmount) {
      touched.current = true;
      return;
    }

    // Set mUSD if the form wasn't touched
    if (mUsdToken) {
      setToken(mUsdToken as Required<typeof mUsdToken>);
    }
  }, [touched, inputAmount, setToken, mUsdToken]);

  // Run validation
  useEffect(() => {
    if (!touched.current) return;

    if (
      !inputAmount ||
      (transactionType === TransactionType.Withdraw && !amountInCredits)
    ) {
      setError(Reasons.AmountMustBeSet);
      return;
    }

    if (!inputAmount.gt(0)) {
      setError(Reasons.AmountMustBeGreaterThanZero);
      return;
    }

    if (!inputAddress) {
      setError(Reasons.TokenMustBeSelected);
      return;
    }

    if (transactionType === TransactionType.Deposit) {
      if (!mUsdToken.balance) {
        setError(Reasons.FetchingData);
        return;
      }

      if (inputAmount.gt(mUsdToken.balance)) {
        setError(Reasons.DepositAmountMustNotExceedTokenBalance);
        return;
      }

      if (needsUnlock) {
        setError(Reasons.MUSDMustBeUnlocked);
        return;
      }
    }

    if (transactionType === TransactionType.Withdraw) {
      if (!savingsBalance.creditsExact) {
        setError(Reasons.FetchingData);
        return;
      }

      if (amountInCredits.gt(savingsBalance.creditsExact)) {
        setError(Reasons.WithdrawAmountMustNotExceedSavingsBalance);
        return;
      }
    }

    setError(null);
  }, [
    needsUnlock,
    setError,
    inputAmount,
    amountInCredits,
    inputAddress,
    mUsdToken.balance,
    savingsBalance,
    transactionType,
    touched,
  ]);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      if (!error && savingsContract && inputAmount && amountInCredits) {
        if (transactionType === TransactionType.Deposit) {
          const manifest: SendTxManifest<
            Interfaces.SavingsContract,
            'depositSavings'
          > = {
            iface: savingsContract,
            args: [inputAmount],
            fn: 'depositSavings',
          };
          sendTransaction(manifest);
        } else if (transactionType === TransactionType.Withdraw) {
          const manifest: SendTxManifest<
            Interfaces.SavingsContract,
            'redeem'
          > = {
            iface: savingsContract,
            args: [amountInCredits],
            fn: 'redeem',
          };
          sendTransaction(manifest);
        }
      }
    },
    [
      error,
      savingsContract,
      inputAmount,
      amountInCredits,
      transactionType,
      sendTransaction,
    ],
  );

  const handleChangeToken = useCallback<
    NonNullable<ComponentProps<typeof TokenAmountInput>['onChangeToken']>
  >(
    (_, tokenDetails) => {
      setToken(tokenDetails);
    },
    [setToken],
  );

  const handleChangeAmount = useCallback<
    NonNullable<ComponentProps<typeof TokenAmountInput>['onChangeAmount']>
  >(
    (_, simpleAmount) => {
      setQuantity(simpleAmount);
    },
    [setQuantity],
  );

  const handleSetMax = useCallback<
    NonNullable<ComponentProps<typeof TokenAmountInput>['onSetMax']>
  >(() => {
    if (transactionType === TransactionType.Deposit) {
      if (mUsdToken?.balance) {
        setQuantity(formatUnits(mUsdToken.balance, mUsdToken.decimals));
      }
    } else if (savingsBalance.creditsExact) {
      setQuantity(
        formatUnits(
          savingsBalance.creditsExact.gt('10000000')
            ? savingsBalance.creditsExact
            : 0,
          18,
        ),
        true,
      );
    }
  }, [mUsdToken, savingsBalance, setQuantity, transactionType]);

  const handleUnlock = useCallback<
    NonNullable<ComponentProps<typeof TokenAmountInput>['onUnlock']>
  >(() => {
    const manifest = {
      iface: mUsdContract,
      fn: 'approve',
      args: [
        savingsContractAddress,
        parseUnits('1844674400000', mUsdToken.decimals),
      ],
    };
    sendTransaction(manifest);
  }, [mUsdToken, savingsContractAddress, sendTransaction, mUsdContract]);

  const toggleTransactionType = useCallback(() => {
    setTransactionType(
      transactionType === TransactionType.Deposit
        ? TransactionType.Withdraw
        : TransactionType.Deposit,
    );
  }, [setTransactionType, transactionType]);

  return (
    <Form onSubmit={handleSubmit}>
      <InfoRow>
        <div>
          <H3>Your mUSD savings balance</H3>
          <CreditBalance>
            <MUSDIconTransparent />
            <CountUp end={savingsBalanceIncreasing || 0} decimals={8} />
          </CreditBalance>
        </div>
      </InfoRow>
      <InfoRow>
        <div>
          <H3>Current APY</H3>
          {apyPercentage ? (
            <InfoCountUp end={apyPercentage} suffix="%" decimals={2} />
          ) : (
            <Skeleton />
          )}
        </div>
        <div>
          <H3 borderTop>Total mUSD supply</H3>
          {mUsd?.token.totalSupply ? (
            <InfoCountUp
              end={parseFloat(mUsd?.token.totalSupply)}
              decimals={2}
            />
          ) : (
            <Skeleton />
          )}
        </div>
        <div>
          <H3 borderTop>Total mUSD savings</H3>
          {mUsdSavings?.totalSavings ? (
            <InfoCountUp
              end={parseFloat(mUsdSavings.totalSavings)}
              decimals={2}
            />
          ) : (
            <Skeleton />
          )}
        </div>
      </InfoRow>
      <TransactionTypeRow>
        <div>Deposit</div>
        <ToggleInput
          onClick={toggleTransactionType}
          checked={transactionType === TransactionType.Withdraw}
          enabledColor={Color.blue}
          disabledColor={Color.green}
        />
        <div>Withdraw</div>
      </TransactionTypeRow>
      <FormRow>
        <H3>
          {transactionType === TransactionType.Deposit
            ? 'Depositing'
            : 'Withdrawing'}
        </H3>
        <TokenAmountInput
          name="input"
          tokenValue={input.token.address}
          amountValue={input.formValue}
          onChangeToken={handleChangeToken}
          onChangeAmount={handleChangeAmount}
          onSetMax={handleSetMax}
          tokenAddresses={tokenAddresses}
          tokenDisabled
          items={musdBalanceItem}
          error={errorMessage}
          needsUnlock={needsUnlock}
          onUnlock={handleUnlock}
        />
      </FormRow>
      <div>
        <SubmitButton
          type="submit"
          size={Size.l}
          disabled={!touched.current || !!errorMessage}
        >
          {transactionType === TransactionType.Deposit ? 'Deposit' : 'Withdraw'}
        </SubmitButton>
        {input.amount.simple && input.token.symbol ? (
          <TransactionDetailsDropdown>
            <>
              <P size={1}>
                You are{' '}
                {transactionType === TransactionType.Deposit
                  ? 'depositing'
                  : 'withdrawing'}{' '}
                <CountUp
                  end={input.amount.simple}
                  suffix={` ${input.token.symbol}`}
                />
                .
              </P>
              {transactionType === TransactionType.Deposit ? (
                <P size={1}>
                  This amount can be withdrawn at any time, without a fee.
                </P>
              ) : null}
            </>
          </TransactionDetailsDropdown>
        ) : null}
      </div>
    </Form>
  );
};

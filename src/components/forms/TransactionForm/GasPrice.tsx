import React, { FC } from 'react';
import styled from 'styled-components';
import { ToggleInput } from '../ToggleInput';
import { Color, ViewportWidth } from '../../../theme';
import { useGasPrices } from '../../../context/TransactionsProvider';
import {
  useSetGasPrice,
  useIsStandard,
  useToggleFast,
  useToggleStandard,
  useToggleInstant,
  useCurrentGasPrice,
  useIsFast,
  useIsInstant,
} from './FormProvider';

interface Props {
  valid: boolean;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  @media (min-width: ${ViewportWidth.m}) {
    flex-direction: row;
    padding-bottom: 16px;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  background: white;
  color: rgb(37, 39, 45);
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  padding: 8px 16px;
  border: 1px rgba(0, 0, 0, 0.2) solid;
  border-radius: 3px;
  width: 100%;
  margin-bottom: 10px;
  margin-right: 15px;
  > :first-child {
    padding-right: 10px;
  }
  @media (min-width: ${ViewportWidth.m}) {
    width: 200px;
    margin-bottom: 0;
  }
`;

const PricesContent = styled.div`
  display: flex;
  ${({ theme }) => theme.mixins.numeric};
  p {
    margin-right: 10px;
  }
  > :last-child {
    color: grey;
    opacity: 70%;
  }
`;

export const GasPrice: FC<Props> = () => {
  const gasPrices = useGasPrices();
  const setGasPrice = useSetGasPrice();
  const isStandard = useIsStandard();
  const isFast = useIsFast();
  const isInstant = useIsInstant();
  const currentGasPrice = useCurrentGasPrice();
  const toggleStandard = useToggleStandard();
  const toggleFast = useToggleFast();
  const toggleInstant = useToggleInstant();

  const onStandard = (): void => {
    if (!currentGasPrice || !isStandard) {
      setGasPrice(gasPrices?.standard as number);
    } else {
      setGasPrice(undefined);
    }
    toggleStandard();
  };

  const onFast = (): void => {
    if (!currentGasPrice || !isFast) {
      setGasPrice(gasPrices?.fast as number);
    } else {
      setGasPrice(undefined);
    }
    toggleFast();
  };

  const onInstant = (): void => {
    if (!currentGasPrice || !isInstant) {
      setGasPrice(gasPrices?.instant as number);
    } else {
      setGasPrice(undefined);
    }
    toggleInstant();
  };

  return (
    <Container>
      <ButtonContent>
        <ToggleInput
          checked={isStandard}
          onClick={onStandard}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>STANDARD</p>
          <PricesContent>
            <p>{gasPrices ? Math.round(gasPrices?.standard * 10) / 10 : '-'}</p>
            <p>$4.20</p>
          </PricesContent>
        </div>
      </ButtonContent>
      <ButtonContent>
        <ToggleInput
          checked={isFast}
          onClick={onFast}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>FAST</p>
          <PricesContent>
            <p>{gasPrices ? Math.round(gasPrices?.fast * 10) / 10 : '-'}</p>
            <p>$4.20</p>
          </PricesContent>
        </div>
      </ButtonContent>
      <ButtonContent>
        <ToggleInput
          checked={isInstant}
          onClick={onInstant}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>INSTANT</p>
          <PricesContent>
            <p>{gasPrices ? Math.round(gasPrices?.instant * 10) / 10 : '-'}</p>
            <p>$4.20</p>
          </PricesContent>
        </div>
      </ButtonContent>
    </Container>
  );
};

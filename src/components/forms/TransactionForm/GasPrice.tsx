import React, { FC } from 'react';
import styled from 'styled-components';
import { ToggleInput } from '../ToggleInput';
import { Color } from '../../../theme';

interface Props {
  valid: boolean;
}

const Container = styled.div`
  display: flex;
  div {
    margin-right: 15px;
  }
  padding-bottom: 16px;
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
  width: fit-content;
  > :first-child {
    padding-right: 10px;
  }
`;

export const GasPrice: FC<Props> = ({ valid }) => {
  // const gasPrices = useGasPrices();
  return (
    <Container>
      <ButtonContent>
        <ToggleInput
          checked={valid}
          // eslint-disable-next-line no-console
          onClick={() => console.log('TODO')}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>STANDARD</p>
          <p>40 $ 4.20</p>
        </div>
      </ButtonContent>
      <ButtonContent>
        <ToggleInput
          disabled={!valid}
          // eslint-disable-next-line no-console
          onClick={() => console.log('TODO')}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>FAST</p>
          <p>40 $ 4.20</p>
        </div>
      </ButtonContent>
      <ButtonContent>
        <ToggleInput
          disabled={!valid}
          // eslint-disable-next-line no-console
          onClick={() => console.log('TODO')}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>INSTANT</p>
          <p>40 $ 4.20</p>
        </div>
      </ButtonContent>
    </Container>
  );
};

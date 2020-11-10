import React, { FC, useCallback, ChangeEventHandler } from 'react';
import styled from 'styled-components';
import { ToggleInput } from '../ToggleInput';
import { Color, ViewportWidth } from '../../../theme';
import {
  useIsCustom,
  useToggleCustom,
  useSetGasPrice,
  useCurrentGasPrice,
} from './FormProvider';

const Container = styled.div`
  display: flex;
  padding-bottom: 16px;
`;

const FlexContainer = styled.div`
  display: flex;
  > :last-child {
    color: grey;
    opacity: 70%;
    ${({ theme }) => theme.mixins.numeric};
  }
`;

const Content = styled.div`
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
  > :first-child {
    padding-right: 10px;
  }
  @media (min-width: ${ViewportWidth.m}) {
    width: 200px;
  }
`;

const Input = styled.input<{ error?: string | void; disabled?: boolean }>`
  appearance: none;
  background: ${({ theme, disabled }) =>
    disabled ? theme.color.blackTransparenter : theme.color.white};

  border: ${({ theme, disabled }) =>
    `1px ${
      disabled ? theme.color.blackTransparent : 'rgba(0, 0, 0, 0.5)'
    } solid`};

  color: ${({ theme, disabled }) => (disabled ? '#404040' : theme.color.black)};
  border-radius: 3px;
  font-size: 16px;
  font-weight: bold;
  min-width: 0;
  width: 100%;
  outline: none;
  height: 20px;
  width: 40px;
  margin-right: 10px;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'auto')};
  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
    background: ${({ theme }) => theme.color.blueTransparent};
  }

  ${({ theme }) => theme.mixins.numeric};
`;

export const CustomGasPrice: FC = () => {
  const isCustom = useIsCustom();
  const toggleCustom = useToggleCustom();
  const setGasPrice = useSetGasPrice();
  const currentGasPrice = useCurrentGasPrice();

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    event => {
      setGasPrice(parseInt(event.target.value, 10));
    },
    [setGasPrice],
  );
  return (
    <Container>
      <Content>
        <ToggleInput
          checked={isCustom}
          onClick={toggleCustom}
          enabledColor={Color.green}
          disabledColor={Color.greyTransparent}
        />
        <div>
          <p>CUSTOM</p>
          <FlexContainer>
            <Input
              disabled={!isCustom}
              value={isCustom ? currentGasPrice : ''}
              placeholder="10"
              onChange={handleChange}
            />
            <p>$4.20</p>
          </FlexContainer>
        </div>
      </Content>
    </Container>
  );
};

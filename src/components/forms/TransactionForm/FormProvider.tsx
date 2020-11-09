/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  FC,
  Reducer,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { SendTxManifest } from '../../../types';

interface State<TState> {
  formId: string;
  manifest?: SendTxManifest<never, never>;
  submitting: boolean;
  gasPrice?: number | undefined;
  gasType?: string;
  isStandard?: boolean;
  isFast?: boolean;
  isInstant?: boolean;
}

interface Dispatch<TState> {
  setManifest<TIface extends any, TFn extends any>(
    manifest: SendTxManifest<TIface, TFn> | null,
  ): void;
  submitStart(): void;
  submitEnd(): void;
  setGasPrice(gasPrice: number | undefined): void;
  toggleStandard(): void;
  toggleFast(): void;
  toggleInstant(): void;
}

enum Actions {
  SetManifest,
  SubmitEnd,
  SubmitStart,
  SetGasPrice,
  ToggleStandard,
  ToggleFast,
  ToggleInstant,
}

type Action<TState> =
  | {
      type: Actions.SetManifest;
      payload: SendTxManifest<never, never> | null;
    }
  | {
      type: Actions.SubmitEnd;
    }
  | {
      type: Actions.SubmitStart;
    }
  | {
      type: Actions.SetGasPrice;
      payload: number | undefined;
    }
  | {
      type: Actions.ToggleStandard;
    }
  | {
      type: Actions.ToggleFast;
    }
  | {
      type: Actions.ToggleInstant;
    };

const stateCtx = createContext<State<any>>({} as any);

const dispatchCtx = createContext<Dispatch<never>>({} as Dispatch<never>);

const reducer: Reducer<State<any>, Action<any>> = (state, action) => {
  switch (action.type) {
    case Actions.SetManifest: {
      const manifest = action.payload || undefined;
      return { ...state, manifest };
    }

    case Actions.SubmitEnd:
      return { ...state, submitting: false };

    case Actions.SubmitStart:
      return { ...state, submitting: true };
    case Actions.SetGasPrice:
      return { ...state, gasPrice: action.payload };
    case Actions.ToggleStandard:
      return {
        ...state,
        isStandard: !state.isStandard,
        isFast: false,
        isInstant: false,
      };
    case Actions.ToggleFast:
      return {
        ...state,
        isFast: !state.isFast,
        isStandard: false,
        isInstant: false,
      };
    case Actions.ToggleInstant:
      return {
        ...state,
        isInstant: !state.isInstant,
        isStandard: false,
        isFast: false,
      };
    default:
      throw new Error('Unhandled action type');
  }
};

export const FormProvider: FC<{ formId: string }> = ({ children, formId }) => {
  const [state, dispatch] = useReducer(reducer, {
    submitting: false,
    formId,
  });

  const setManifest = useCallback<Dispatch<never>['setManifest']>(
    manifest => {
      dispatch({ type: Actions.SetManifest, payload: manifest as any });
    },
    [dispatch],
  );

  const submitStart = useCallback<Dispatch<never>['submitStart']>(() => {
    dispatch({ type: Actions.SubmitStart });
  }, [dispatch]);

  const submitEnd = useCallback<Dispatch<never>['submitEnd']>(() => {
    dispatch({ type: Actions.SubmitEnd });
  }, [dispatch]);

  const setGasPrice = useCallback<Dispatch<never>['setGasPrice']>(
    gasPrice => {
      dispatch({
        type: Actions.SetGasPrice,
        payload: gasPrice || undefined,
      });
    },
    [dispatch],
  );

  const toggleStandard = useCallback<Dispatch<never>['toggleStandard']>(() => {
    dispatch({ type: Actions.ToggleStandard });
  }, [dispatch]);

  const toggleFast = useCallback<Dispatch<never>['toggleFast']>(() => {
    dispatch({ type: Actions.ToggleFast });
  }, [dispatch]);

  const toggleInstant = useCallback<Dispatch<never>['toggleInstant']>(() => {
    dispatch({ type: Actions.ToggleInstant });
  }, [dispatch]);

  return (
    <stateCtx.Provider value={state}>
      <dispatchCtx.Provider
        value={useMemo(
          () => ({
            setManifest,
            submitEnd,
            submitStart,
            setGasPrice,
            toggleStandard,
            toggleFast,
            toggleInstant,
          }),
          [
            setManifest,
            submitEnd,
            submitStart,
            setGasPrice,
            toggleStandard,
            toggleFast,
            toggleInstant,
          ],
        )}
      >
        {children}
      </dispatchCtx.Provider>
    </stateCtx.Provider>
  );
};

const useStateCtx = <TState extends unknown>(): State<TState> =>
  useContext(stateCtx) as State<TState>;

const useDispatchCtx = <TState extends unknown>(): Dispatch<TState> =>
  useContext(dispatchCtx) as Dispatch<TState>;

export const useManifest = (): State<never>['manifest'] =>
  useStateCtx().manifest;

export const useFormSubmitting = (): State<never>['submitting'] =>
  useStateCtx().submitting;

export const useIsStandard = (): State<never>['isStandard'] =>
  useStateCtx().isStandard;

export const useIsFast = (): State<never>['isFast'] => useStateCtx().isFast;

export const useIsInstant = (): State<never>['isInstant'] =>
  useStateCtx().isInstant;

export const useCurrentGasPrice = (): State<never>['gasPrice'] =>
  useStateCtx().gasPrice;

export const useFormId = (): State<never>['formId'] => useStateCtx().formId;

export const useSetFormManifest = (): Dispatch<never>['setManifest'] =>
  useDispatchCtx().setManifest;

export const useSubmitStart = (): Dispatch<never>['submitStart'] =>
  useDispatchCtx().submitStart;

export const useSubmitEnd = (): Dispatch<never>['submitEnd'] =>
  useDispatchCtx().submitEnd;

export const useSetGasPrice = (): Dispatch<never>['setGasPrice'] =>
  useDispatchCtx().setGasPrice;

export const useToggleStandard = (): Dispatch<never>['toggleStandard'] =>
  useDispatchCtx().toggleStandard;

export const useToggleFast = (): Dispatch<never>['toggleFast'] =>
  useDispatchCtx().toggleFast;

export const useToggleInstant = (): Dispatch<never>['toggleInstant'] =>
  useDispatchCtx().toggleInstant;

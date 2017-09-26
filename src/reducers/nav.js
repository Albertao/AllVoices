import {Router} from '../router'

// const initialState = Router.router.getStateForAction(Router.router.getActionForPathAndParams('Xiami'));

export default function navReducer(state, action) {
  const nextState = Router.router.getStateForAction(action, state);

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState;
}

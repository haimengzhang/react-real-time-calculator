// Types and functions to change state according to the types
import {
  CLEAR,
  DIGIT,
  EXECUTE,
  OPERATOR,
  USE_EQUATION,
  initialState,
} from './constants'
import {
  inputDigit,
  inputDigitPostExec,
  inputExecute,
  inputExecutePostExec,
  inputOperator,
  inputOperatorPostExec,
  clickEquation,
  midStateChange,
} from './functions'

import {
  socket
} from '../components/Calculator'

// reducer to change state based on input type
function normalReducer(state, action) {
  switch (action.type) {
    case DIGIT:
      return inputDigit(action.digit)(state)
    case OPERATOR:
      return inputOperator(action.operator)(state)
    case EXECUTE:
      const newState = inputExecute()(state)
      //Emit to server with the new history state property
      socket.emit('new history', {
        history: newState.history,
        digit: newState.digits
      })
      console.log('The reducer after inputEXECUTE has digit: ', newState.digits)
      return newState
    case USE_EQUATION:
      return clickEquation(action.id)(state)
    case CLEAR:
      return initialState
    default:
      return state
  }
}

function postExecReducer(state, action) {
  switch (action.type) {
    case DIGIT:
      return inputDigitPostExec(action.digit)(state)
    case OPERATOR:
      return inputOperatorPostExec(action.operator)(state)
    case EXECUTE:
      return inputExecutePostExec()(state)
    case USE_EQUATION:
      return clickEquation(action.id)(state)
    case CLEAR:
      return initialState
    default:
      return state
  }
}
// New action {type: DIGIT, 7}, last = EXECUTE
export function calculatorReducer(state, action) {
  //skip if pressing duplicate '=' or operator
  const shouldSkip = //EXECUTE      DIGIT             EXECUTE
    [OPERATOR, EXECUTE].includes(state.last) && action.type === state.last

  if (shouldSkip) return state

  // store the previous digits and key press                     95 + 1 
  const midState = midStateChange(action.type)(state) // if my aciton is '=', last: EXECUTE, 
  // '7'

  return state.didExecute ?
    postExecReducer(midState, action) :
    normalReducer(midState, action) // decides if its '=', then call inputExec to update history
}
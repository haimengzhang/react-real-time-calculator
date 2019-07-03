import React, { useState, useEffect, useReducer, useMemo } from 'react'

import KeyPad from './KeyPad'
import Display from './Display'

import { is, substituteKey, calculateEquation } from '../helpers'
import { action } from '../state/actions'
import { initialState } from '../state/constants'
import { calculatorReducer } from '../state/reducers'
// SocketContext
import { CalculatorDispatch } from './context'

import socketIOClient from 'socket.io-client'

const logState = reducer => (state, action) => {
  const newState = reducer(state, action)
  console.log(newState)
  return newState
}

const reducer =
  process.env.NODE_ENV === 'development'
    ? logState(calculatorReducer)
    : calculatorReducer

export const socket = socketIOClient('http://127.0.0.1:8000')

// SocketProvider
function Calculator () {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [history, setHistory] = useState(state.history)

  // useEffect hook to capture `keydown` events, change state by dispatch action
  useEffect(() => {
    // onKeyDown is a function that fires if the browser detects a key down
    const onKeyDown = event => {
      event.preventDefault()
      const key = substituteKey(event.key)
      if (is.key(key)) dispatch(action(key))
    }

    // Keydown event listener on every connected user.
    // When a key is pressed, onKeyDown is called to dispatch an action that changes the state variable.
    document.addEventListener('keydown', onKeyDown, false)
    // socket.emit('new-state-change', onKey)
    return () => {
      document.removeEventListener('keydown', onKeyDown, false)
    }
  })

  // probably unnecessary but with useMemo 'acc' is only recalculated when
  // state.equation changes and not with every re-render
  const calculateAcc = eq => (eq.length < 3 ? 0 : calculateEquation(eq))
  const acc = useMemo(() => calculateAcc(state.equation), [state.equation])

  const show = ['OPERATOR', 'EXECUTE', 'USE_EQUATION'].includes(state.last)
    ? acc
    : state.digits

  // Print message for Console Debugging
  // console.log(
  //   '1. The current state.history just before return rendering: ',
  //   state.history
  // )

  // Socket listens for remote incoming history update from server
  socket.on('new history', newHistoryData => {
    // console.log('2. The incoming new hisotry data: ', newHistoryData)
    setHistory(newHistoryData)
    console.log('3. The history after setHistory: ,  ', history)
  })
  // The SocketContext. Passes a global disptach to change the state anywhere in the app
  return (
    <main>
      <CalculatorDispatch.Provider value={dispatch}>
        <Display // Display pass the props to index.js that renders <HistoryScreen>, <EquationScreen> and <InputScreen>
          history={history}
          equation={state.equation}
          input={show}
        />
        <KeyPad history={state.history} />
        {/* <ul>
          {history.reverse().map((value, index) => {
            return (
              <li style={{ listStyleType: 'none' }} key={index}>
                {value}
              </li>
            )
          })}
        </ul> */}
      </CalculatorDispatch.Provider>
    </main>
  )
}

export default Calculator

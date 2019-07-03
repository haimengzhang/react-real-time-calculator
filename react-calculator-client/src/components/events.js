import { socket } from './Calculator'
import { CalculatorDispatch } from './context'
const [dispatch] = useContext(CalculatorDispatch)

// listens for evetns emitted from the server
// export const socketEvents = ({dispatch}) =>{
//     socket.on('new-remote-calculation', ({key})=>{
//         dispatch(actions(key))
//     }
// }

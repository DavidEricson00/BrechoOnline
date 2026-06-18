import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Deposito() {

    const navigate = useNavigate()
    const {usuarioLogado} = useAuth()

    const [valor, setValor] = useState(0)
    const [alerta, setAlerta] = useState('')

    async function handleDeposito(){
            if(valor>0){
                usuarioLogado.vats+= valor
                setAlerta("Estamos processando sua compra...")
                navigate("/perfil")
            } else {
                setAlerta('Por favor, insira um valor maior que 0')
            }
            console.log(usuarioLogado.vats)
            
        

    }

    return(
        <>
        <h1>Realizar Depósito</h1>
        <br />
        

    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1rem', alignItems: 'start' }}>
        <input value={valor} onChange={(e) => {setValor(Number(e.target.value))} } type='number' min={0} className="field-control"/> <span>VATs</span>
        <div>{alerta}</div>
    </div>

        <button onClick={() => setValor(valor+1)}>+1</button> <button onClick={() => setValor(valor+5)}>+5</button> <button onClick={() => setValor(valor+10)}>+10</button> <button onClick={() => setValor(valor+50)}>+50</button> <button onClick={() => setValor(valor+100)}>+100</button>
        
        <br />
        <button onClick={() => navigate(-1)}> Voltar </button>
        <button onClick={() => handleDeposito()}> Confirmar </button>

    
    </>        
)
}
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { useAuth  } from '../context/AuthContext';

export function Saque() {

    const navigate = useNavigate()
    const {usuarioLogado} = useAuth()
    const usuarios = JSON.parse(localStorage.getItem("usuarios"))
 //[{},{}] 
    

    const [valor, setValor] = useState(0)
    const [alerta, setAlerta] = useState('')

    function handleSaque(){
            if(valor>0 && valor <= usuarioLogado.vats){
                usuarioLogado.vats -= valor
                
                let usuariosAtualizado = usuarios.map((u) => 
                    u.id == usuarioLogado.id ? {...u, vats: usuarioLogado.vats} : u)
                
                localStorage.setItem("usuarios", JSON.stringify(usuariosAtualizado))

                setAlerta("Estamos processando sua transação...")
                navigate("/perfil")
            } else {
                setAlerta('Por favor, insira um número válido')
            }

            
        

    }

    return(
        <>
        <h1>Realizar Saque</h1>
        <br />
        

    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1rem', alignItems: 'start' }}>
        <input value={valor} onChange={(e) => {setValor(Number(e.target.value))} } type='number' min={0} className="field-control"/> <span>VATs</span>
        <div>{alerta}</div>
    </div>

        <button onClick={() => setValor(valor+1)} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>+1</button> 
        <button onClick={() => setValor(valor+5)} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>+5</button> 
        <button onClick={() => setValor(valor+10)} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>+10</button>
         <button onClick={() => setValor(valor+50)} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>+50</button> 
         <button onClick={() => setValor(valor+100)} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>+100</button>
        
        <br />
        <div style={{display:"flex", justifyItems: "center"}}>
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}> Voltar </button>
        <button onClick={() => handleSaque()} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}> Confirmar </button>
        </div>
    
    </>        
)
}
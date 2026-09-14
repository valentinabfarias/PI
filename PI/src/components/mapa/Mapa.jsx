import './mapa.css';

function Mapa () { 
    const casas = []
    // Cria os números de 1 a 20
    for (let i = 1; i <= 12; i++) {
        casas.push(i);
    }

    return (
        <>
            <div className="mapa" id="mapa">
                {casas.map((key) => (
                <div className="item" key={key}></div>
                ))}
            </div>
        </>
    )
}

export default Mapa
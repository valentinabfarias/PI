import './mobile-footer.css';
import Failsafe from '../assets/default.jpg'

function MobileFooter () {
    return (
        <footer id="mobile-footer">
            <table>
                <tr>
                    <td>
                        <img src={Failsafe} className="footer-icon"></img>
                    </td>
                    
                    <td>
                        <img src={Failsafe} className="footer-icon"></img>
                    </td>

                    <td>
                        <img src={Failsafe} className="footer-icon"></img>
                    </td>

                    <td>
                        <img src={Failsafe} className="footer-icon"></img>
                    </td>
                </tr>
            </table>
        </footer>
    )
}

export default MobileFooter
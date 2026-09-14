import './mobile-footer.css';
import Failsafe from '../assets/default.jpg'

function MobileFooter () {
    return (
        <footer id="mobile-footer">
            <span>
                <div>
                    <img src={Failsafe} className="footer-icon"></img>
                </div>
                
                <div>
                    <img src={Failsafe} className="footer-icon"></img>
                </div>

                <div>
                    <img src={Failsafe} className="footer-icon"></img>
                </div>

                <div>
                    <img src={Failsafe} className="footer-icon"></img>
                </div>
            </span>
        </footer>
    )
}

export default MobileFooter
import React, { Component } from 'react';
import axios from 'axios';
import login from './Login.jsx';
import { Link, Redirect} from 'react-router-dom';
import { AppBar, IconButton, IconMenu, MenuItem } from 'material-ui/';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Menu from 'material-ui/svg-icons/navigation/menu';
import UpDown from 'material-ui/svg-icons/action/swap-vertical-circle';
import { Grid, Row, Col } from 'react-flexbox-grid';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
render() {

    return (
      <div className="nav-container">
      <div>
       <AppBar className='main-navigation-site'
          title="SoundCrowd"
          onRightIconButtonTouchTap={ this._toggleNav }
          iconElementLeft={<IconButton><UpDown /></IconButton>}
          iconElementRight={
            <IconMenu
              iconButtonElement={<IconButton><Menu /></IconButton>}
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
              >
            <Link to='/app' style={style.link}><MenuItem><div>Use My Playlist</div></MenuItem></Link>
            <Link to='/app/search' style={style.link}><MenuItem><div>Search</div></MenuItem></Link>
            <Link to='/login' style={style.link}><MenuItem><div onClick={this.props.logout}>Logout</div></MenuItem></Link>
           </IconMenu>
      }
        />
        </div>
      </div>
    )
  }
}

export default Navbar;

const style = {
  link: {
    textDecoration: 'none'
  }
};
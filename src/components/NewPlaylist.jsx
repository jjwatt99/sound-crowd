import React from 'react';
import axios from 'axios';

class NewPlaylist extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			href: ''
		}
	}

	componentWillMount() {
		axios.get('/test')
		.then(result => {
			console.log('test result: ', result.data);
			var num = Math.floor(Math.random() / (1 / result.data.length));
		  this.setState({
		  	href: result.data[num].external_urls.spotify
		  });
		});
	}

	render() {
		console.log(this.props.state.mood);
		console.log(this.props.state.activity);
	  return (
	  	<div>
	  	  <h1>Recommended Playlist</h1>
	  	  <a href={this.state.href}>Your Playlist</a>	  
		  </div>	
	  );
	}
}

export default NewPlaylist;
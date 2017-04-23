import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { setPlaylist, setPlaylistId, setPlaylistTracks, setPlaylistOwner, setVoteErrorPopup } from '../actions/playlistActions';

import AccordionTest from './AccordionTest.jsx';
import CurrentSongBar from './currentSongBar/CurrentSongBar.jsx';
import VoteErrorPopup from './VoteErrorPopup.jsx';

import Track from './Track.jsx';
import { Button } from 'elemental';

import io from 'socket.io-client';
import FlipMove from 'react-flip-move';

class Playlist extends Component {

  componentWillMount () {
    this.socket = io.connect();
    this.votingError = false;
    this.getPlaylistTracks = this.getPlaylistTracks.bind(this);
    this.handlePlaylistVote = this.handlePlaylistVote.bind(this);
    this.handlePlaylistUpdate = this.handlePlaylistUpdate.bind(this);
    this.getSessionInfo = this.getSessionInfo.bind(this);
    this.handleSongVoteUpdate = this.handleSongVoteUpdate.bind(this);
    this.displayTracks = this.displayTracks.bind(this);
    this.startPlaylist = this.startPlaylist.bind(this);
  }

  handlePlaylistVote(song_id, playlist_id, vote_val){
    const { user_id, session_id } = this.socket;
    let voteData = {
      songId: song_id,
      playlistId: playlist_id,
      vote: vote_val,
      user_id: user_id,
      session_id: session_id
    }
    this.socket.emit('recordVote', voteData);
    this.handleVoteError = this.handleVoteError.bind(this);
  }

  componentDidMount() {
    this.getPlaylistTracks();
    this.socket.emit('playlistId', this.props.match.params.playlistId)
    this.socket.on('join', joinedRoom => {
      this.getSessionInfo();
    });
    this.socket.on('updatePlaylist', playlistData => {
      this.handlePlaylistUpdate(playlistData);
    });
    this.socket.on('updateSongVoteCount', songVoteData => {
      this.handleSongVoteUpdate(songVoteData);
    });
    this.socket.on('voteError', voteErrorInfo => {
      this.handleVoteError(true, voteErrorInfo);
      console.log('Sorry, but you\'ve already voted:', voteErrorInfo);
    });
  }

  getSessionInfo() {
    axios.get('/api/user/session_info')
      .then(res => {
        const { session_id, user_id } = res.data;
        this.socket.session_id = session_id;
        this.socket.user_id = user_id;
      })
      .catch(err => {
        console.log(err);
      });
  }

  handlePlaylistVote(song_id, playlist_id, vote_val){
    let voteData = {
      songId: song_id,
      playlistId: playlist_id,
      vote: vote_val,
      user_id: this.socket.user_id,
      session_id: this.socket.session_id
    }
    this.socket.emit('recordVote', voteData)
  }

  getPlaylistTracks() {
    const playlistId = this.props.match.params.playlistId;
    axios.get('/api/playlists/' + playlistId)
    .then(res => {
      this.props.setPlaylist({
        id: playlistId,
        owner: res.data.owner,
        tracks: res.data.tracks
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  handlePlaylistUpdate(playlist) {
    if(!playlist){
      console.log('ERROR WITH PLAYLIST');
    } else {
      this.props.setPlaylistTracks(playlist);
    }
  }

  handleSongVoteUpdate(songVoteData) {
    const { songId, vote } = songVoteData;
    let tracks = this.props.playlist.tracks;
    tracks = tracks.map(track => {
      if(track.song_id === songId){
        track.vote_count += vote
        return track;
      } else {
        return track;
      }
    })
    this.props.setPlaylistTracks(tracks);
  }

  handleVoteError(open, message){
    this.votingError = true;
    this.props.setVoteErrorPopup(true, message);
    this.votingError = false;
  }

  startPlaylist() {
    axios.post('/api/spotify/play', { playlist: this.props.match.params.playlistId })
    .catch(err => {
      console.log(err);
    });
  }

  displayTracks() {
    const { tracks, id } = this.props.playlist;

    return tracks.map((track, ind) => (
      <Track key={track.song_id} 
      playlist={id} 
      track={track}
      isTop={ind === 0 ? true : false}
      getPlaylistTracks={this.getPlaylistTracks}
      handlePlaylistVote={this.handlePlaylistVote} />
    ));
  }

  render() {
    const { tracks, id, owner, voteErrorPopup } = this.props.playlist;
    const { open, message } = voteErrorPopup;
    return (
      <div>
        <div>
          <CurrentSongBar />
          <div>
            <a href={`http://open.spotify.com/user/${owner}/playlist/${id}`} target="_blank">
              <Button type="primary" onClick={this.startPlaylist}><span>Open in Spotify</span></Button>
            </a>
          </div>
          <div><VoteErrorPopup open={this.votingError} message={message} onVoteError={this.handleVoteError}/></div>

          <FlipMove>
          {this.renderTracks()}
          </FlipMove>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    playlist: state.playlist 
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPlaylist: playlist => {  
      dispatch(setPlaylist(playlist));
    },
    setPlaylistId: id => { 
      dispatch(setPlaylistId(id));
    },
    setPlaylistTracks: tracks => { 
      dispatch(setPlaylistTracks(tracks));
    },
    setPlaylistOwner: owner => { 
      dispatch(setPlaylistOwner(owner));
    },
    setVoteErrorPopup: (visibility, message) => {
      dispatch(setVoteErrorPopup(visibility, message));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);
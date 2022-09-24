import React, { Component } from 'react';

export default class SongModal extends Component {
    render() {
        const {editSongCallback, hideEditSongModalCallback } = this.props;

        return (
            <div 
                className="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div className="modal-root" id='verify-edit-song-root'>
                        <div className="modal-north">
                            Edit Song
                        </div>
                        <div className="modal-center">
                            <div className="modal-center-content">
                                <div id="edit-modal-content">
                                    <p>Title: </p> 
                                    <input type="text" id="edit-song-title" />
                                    <br />
                                    <p>Artist: </p>
                                    <input type="text" id="edit-song-artist" />
                                    <br />
                                    <p>YouTube Id: </p>
                                    <input type="text" id="edit-song-youTubeId" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                className="modal-button" 
                                onClick={editSongCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                className="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}

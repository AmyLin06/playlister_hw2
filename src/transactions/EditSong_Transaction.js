import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * EditSong_Transaction
 * 
 * This class represents a transaction that works with edit song. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, index, newTitle, newArtist, newYouTubeId) {
        super();
        this.app = initApp;
        this.editSongIndex = index;
        this.editTitle = newTitle;
        this.editArtist = newArtist;
        this.editYouTubeId = newYouTubeId;
        this.originalSong = null;
    }

    doTransaction() {
        this.originalSong = this.app.editMarkedSong(this.editSongIndex, this.editTitle, this.editArtist, this.editYouTubeId)
    }
    
    undoTransaction() {
        let origTitle = this.originalSong.title;
        let origArtist = this.originalSong.artist;
        let origYTId = this.originalSong.youTubeId;
        this.app.editSong(this.editSongIndex, origTitle, origArtist, origYTId);
    }
}
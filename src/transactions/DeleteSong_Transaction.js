import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * DeleteSong_Transaction
 * 
 * This class represents a transaction that works with delete song. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, index) {
        super();
        this.app = initApp;
        this.deleteSongIndex = index;
        this.deleteSong = null;
        this.performingUndoRedo = false;
    }

    doTransaction() {
        if(this.performingUndoRedo){
            this.app.deleteSong(this.deleteSongIndex);
        }else{
            this.deleteSong = this.app.markSongForDeletion(this.deleteSongIndex);
        }
        this.performingUndoRedo = true;
    }
    
    undoTransaction() {
        this.app.createNewSong(this.deleteSongIndex, this.deleteSong);
    }
}
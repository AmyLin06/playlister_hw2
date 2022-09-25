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
    }

    doTransaction() {
        this.deleteSong = this.app.deleteMarkedSong(this.deleteSongIndex);
    }
    
    undoTransaction() {
        this.app.createNewSong(this.deleteSongIndex, this.deleteSong);
    }
}
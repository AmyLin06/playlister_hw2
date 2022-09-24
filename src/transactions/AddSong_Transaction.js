import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * AddSong_Transaction
 * 
 * This class represents a transaction that works with add song. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, list) {
        super();
        this.app = initApp;
        this.currentList = list
    }

    doTransaction() {
        this.app.createNewSong(null, null);
    }
    
    undoTransaction() {
        this.app.deleteSong(this.currentList.songs.length - 1);
    }
}
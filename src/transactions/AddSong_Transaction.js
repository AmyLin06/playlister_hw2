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
        console.log(list);
        this.currentList = list;
        this.index = this.app.state.currentList.songs.length;
    }

    doTransaction() {
        this.app.createNewSong(null, null);
    }
    
    undoTransaction() {
        console.log("length" + this.index);
        this.app.deleteSong(this.index);
    }
}
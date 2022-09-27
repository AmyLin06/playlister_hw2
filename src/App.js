import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal.js';
import EditSongModal from './components/EditSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import EditSong_Transaction from './transactions/EditSong_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // MODAL BOX BOOLEAN
        this.modalOpen = false;

        //LIST EDIT ACTIVE
        //this.listEditActive = false;

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            songIndexMarkedForDeletion : null,
            songIndexMarkedForEdit : null,
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }    

    //CREATE NEW SONG
    createNewSong = (index, song) => {
        if(this.state.currentList != null){
            let newList = this.state.currentList;
            if(index != null && song != null){
                newList.songs.splice(index, 0, song);
            }else{
                //MAKE THE NEW SONG
                let newSong = {
                    title: "Untitled",
                    artist: "Unknown",
                    youTubeId: "dQw4w9WgXcQ"
                };
                //CREATE A NEW LIST WITH THE CURRENT LIST OF SONGS + NEW SONG
                newList.songs.push(newSong);
            }
            this.setStateWithUpdatedList(newList);
        }
    }

    addSongTransaction = () => {
        let transaction = new AddSong_Transaction(this, this.state.currentList);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }

    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs

            },
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.setState(this.state);
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData,
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {

            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {

            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }

    markSongForDeletion = (index) => {
        this.modalOpen = true;

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            songIndexMarkedForDeletion: index,
        }), () => {
            //PROMPT THE USER
            this.showDeleteSongModal();
        });
        return this.state.currentList.songs[index];
    }

    addDeleteSongTransaction = (index) => {
        if(this.state.songIndexMarkedForDeletion != null){
            let newIndex = this.state.songIndexMarkedForDeletion
            let transaction = new DeleteSong_Transaction(this, newIndex);
            this.tps.addTransaction(transaction);
        }
    }

     
    deleteSong = (deleteSongIndex) => {
        if(this.state.currentList != null){
            let newList = this.state.currentList;
            newList.songs.splice(deleteSongIndex, 1);
            
            this.setState(prevState => ({
                listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
                currentList : newList,
                sessionData : this.state.sessionData,
                songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion
            }), () => {
                // UPDATING THE LIST IN PERMANENT STORAGE
                // IS AN AFTER EFFECT
                this.db.mutationUpdateList(this.state.currentList);
            });
        }
        
    }

    deleteMarkedSong = (index) => {
        if(index != null){
            let originalDelSong = this.state.currentList.songs[index];
            this.deleteSong(index);
            this.hideDeleteSongModal();
            return originalDelSong;
        }
    }

    showDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
    }

    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.modalOpen = false;

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : prevState.currentList,
            sessionData : prevState.sessionData,
            songIndexMarkedForDeletion: null
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }

    markSongForEdit = (index) => {
        this.modalOpen = true;
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion,
            songIndexMarkedForEdit: index
        }), () => {
            //PROMPT THE USER
            this.showEditSongModal();
        })
        let editSong = this.state.currentList.songs[index];
        document.getElementById('edit-song-title').value = editSong.title;
        document.getElementById('edit-song-artist').value = editSong.artist;
        document.getElementById('edit-song-youTubeId').value = editSong.youTubeId;
    }

    addEditSongTransaction = () => {
        if(this.state.songIndexMarkedForEdit != null){  
            let newIndex = this.state.songIndexMarkedForEdit;
            let newTitle = document.getElementById('edit-song-title').value;
            let newArtist = document.getElementById('edit-song-artist').value;
            let newYouTubeId = document.getElementById('edit-song-youTubeId').value;

            let transaction = new EditSong_Transaction(this, newIndex, newTitle, newArtist, newYouTubeId);
            this.tps.addTransaction(transaction);
        }
    }

    editMarkedSong = (index, newTitle, newArtist, newYouTubeId) => {
            let origSong = this.state.currentList.songs[index];
            this.editSong(index, newTitle, newArtist, newYouTubeId);
            this.hideEditSongModal();

            return origSong;
        
    }

    
    editSong = (index, newTitle, newArtist, newYouTubeId) => {
        if(this.state.currentList != null){
            let newSong = {
                title: newTitle,
                artist: newArtist,
                youTubeId: newYouTubeId
            }
            let newList = this.state.currentList;
            newList.songs.splice(index, 1, newSong);

            //RESET SONG INDEX MARKED FOR EDIT
            this.setState(prevState => ({
                listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
                currentList : newList,
                sessionData : prevState.sessionData,
                songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion,
                songIndexMarkedForEdit : prevState.songIndexMarkedForEdit
            }), () => {
                // UPDATING THE LIST IN PERMANENT STORAGE
                // IS AN AFTER EFFECT
                this.db.mutationUpdateList(newList);
            });
        }
    }

    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
    }

    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");

        this.modalOpen = false;
        //RESET SONG INDEX MARKED FOR EDIT
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : prevState.currentList,
            sessionData : prevState.sessionData,
            songIndexMarkedForDeletion: prevState.songIndexMarkedForDeletion,
            songIndexMarkedForEdit : null
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }

    /*disableButton = (bool) => {
        if(document.getElementById("add-list-button") != null){
            document.getElementById("add-list-button").disabled = bool;
        }
    }*/

    handleCtrlZY = (event) => {
        if(event.ctrlKey && event.key === "z"){
            this.undo();
        }
        if(event.ctrlKey && event.key === "y"){
            this.redo();
        }
    }

    // disableEditToolbar = () => {
    //     this.modalOpen = true;
    //     this.setState(this.state);
    // }

    // enableEditToolbar = () => {
    //     this.modalOpen = false;
    //     this.setState(this.state);
    // }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        let canAddList = this.state.currentList == null;
        
        return (
            <div id="root" onKeyDown = {this.handleCtrlZY}>
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList={canAddList}
                    //disableButtonCallback={this.disableButton}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    // editActiveCallback={this.disableEditToolbar}
                    // editNotActiveCallback={this.enableEditToolbar}
                />
                <EditToolbar
                    modalOpen={this.modalOpen}
                    //listEditActive={this.listEditActive}
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    createNewSongCallback={this.addSongTransaction}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    deleteSongCallback={this.markSongForDeletion}
                    editSongCallback={this.markSongForEdit}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    index={this.state.songIndexMarkedForDeletion}
                    currentList={this.state.currentList !== null ? this.state.currentList : null}
                    deleteSongCallback={this.addDeleteSongTransaction}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}
                />
                <EditSongModal
                    index = {this.state.songIndexMarkedForEdit}
                    editSongCallback={this.addEditSongTransaction}
                    hideEditSongModalCallback={this.hideEditSongModal} 
                />
            </div>
        );
    }
}

export default App;

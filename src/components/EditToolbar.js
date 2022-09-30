import { toHaveStyle } from "@testing-library/jest-dom/dist/matchers";
import React from "react";

export default class EditToolbar extends React.Component {
    handleAddSong = (event) => {
        if(this.props.canAddSong && !this.props.modalOpen){
            const {createNewSongCallback} = this.props;
            createNewSongCallback();
        }
    }

    handleRedo = (event) => {
        if(this.props.canRedo && !this.props.modalOpen){
            this.props.redoCallback();
        }
    }

    handleClose = (event) => {
        if(this.props.canClose && !this.props.modalOpen){
            this.props.closeCallback();
        }
    }

    render() {
        const { modalOpen, canAddSong, canUndo, canRedo, canClose, 
                undoCallback, redoCallback, closeCallback, listEditActive} = this.props;
        let addSongClass = "playlister-button";
        let undoClass = "playlister-button";
        let redoClass = "playlister-button";
        let closeClass = "playlister-button";
        if (!canAddSong || modalOpen) addSongClass += " playlister-button-disabled";
        if (!canUndo || modalOpen ) undoClass += " playlister-button-disabled";
        if (!canRedo || modalOpen) redoClass += " playlister-button-disabled";
        if (!canClose || modalOpen) closeClass += " playlister-button-disabled";
        return (
            <div id="edit-toolbar">
            <input 
                type="button" 
                id='add-song-button' 
                value="+" 
                className={addSongClass}
                onClick={this.handleAddSong}
            />
            <input 
                type="button" 
                id='undo-button' 
                value="⟲" 
                className={undoClass} 
                disabled={!canUndo || modalOpen}
                onClick={undoCallback}
            />
            <input 
                type="button" 
                id='redo-button' 
                value="⟳" 
                className={redoClass} 
                onClick={this.handleRedo}
            />
            <input 
                type="button" 
                id='close-button' 
                value="&#x2715;" 
                className={closeClass} 
                onClick={this.handleClose}
            />
        </div>
        )
    }
}
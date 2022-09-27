import React from "react";

export default class ListCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.keyNamePair.name,
            editActive: false,
        }
    }
    
    handleClick = (event) => {
        if (event.detail === 1) {
            this.handleLoadList(event);
        }
        else if (event.detail === 2) {
            //document.getElementById("add-song-button").disabled = true;
            //document.getElementById("undo-button").disabled = true;
            //document.getElementById("redo-button").disabled = true;
            //document.getElementById("close-button").disabled = true;
            this.handleToggleEdit(event);
            // this.props.editActiveCallback();
        }
    }
    handleLoadList = (event) => {
        let listKey = event.target.id;
        if (listKey.startsWith("list-card-text-")) {
            listKey = listKey.substring("list-card-text-".length);
        }
        this.props.loadListCallback(listKey);
    }
    handleDeleteList = (event) => {
        event.stopPropagation();
        this.props.deleteListCallback(this.props.keyNamePair);
    }
    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
        //this.props.listEditActive(this.state.editActive);
    }
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let key = this.props.keyNamePair.key;
        let textValue = this.state.text;
        console.log("ListCard handleBlur: " + textValue);
        this.props.renameListCallback(key, textValue);
        //document.getElementById("add-song-button").disabled = false;
        //document.getElementById("undo-button").disabled = false;
        //document.getElementById("redo-button").disabled = false;
        //document.getElementById("close-button").disabled = false;
        this.handleToggleEdit();
        // this.props.editNotActiveCallback();
    }

    render() {
        const { keyNamePair, selected } = this.props;

        if (this.state.editActive) {
            return (
                <input
                    id={"list-" + keyNamePair.name}
                    className='list-card'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={keyNamePair.name}
                />)
        }
        else {

            let selectClass = "unselected-list-card";
            if (selected) {
                selectClass = "selected-list-card";
            }
            return (
                <div
                    id={keyNamePair.key}
                    key={keyNamePair.key}
                    onClick={this.handleClick}
                    className={'list-card ' + selectClass}>
                    <span
                        id={"list-card-text-" + keyNamePair.key}
                        key={keyNamePair.key}
                        className="list-card-text">
                        {keyNamePair.name}
                    </span>
                    <input
                        type="button"
                        id={"delete-list-" + keyNamePair.key}
                        className="list-card-button"
                        onClick={this.handleDeleteList}
                        value={"🗑"} />
                </div>
            );
        }
    }
}
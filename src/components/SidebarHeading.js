import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        const { createNewListCallback } = this.props;
        createNewListCallback();
    };

    render() {
        let addListClass = "toolbar-button";
        if(!this.props.canAddList) {
            addListClass += " disabled";
            //this.props.disableButtonCallback(true)
        }
        //this.props.disableButtonCallback(false)
        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className = {addListClass} 
                    onClick={this.handleClick}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}
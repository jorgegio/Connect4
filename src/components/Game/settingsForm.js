import React from 'react';

const SettingsForm = ({setPlayers}) => {

    const onSubmit = (e) => {
        e.preventDefault();

        const values = e.target.elements;
        
        setPlayers({
            r: {
                name: values.redName.value,
                type: values.redType.value
            },
            y: {
                name: values.yellowName.value,
                type: values.yellowType.value
            }
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <input required name="redName" placeholder="Red player name"/>
            <select name="redType">
                <option value="Human">Human</option>
                <option value="Bot">Bot</option>
            </select>
            <input required name="yellowName" placeholder="Yellow player name"/>
            <select name="yellowType">
                <option value="Human">Human</option>
                <option value="Bot">Bot</option>
            </select>
            <button>Submit</button>
        </form>
    );

}

export default SettingsForm;
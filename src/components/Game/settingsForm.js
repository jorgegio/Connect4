import React from 'react';

const SettingsForm = ({setPlayers}) => {

    const onSubmit = (e) => {
        e.preventDefault();

        const values = e.target.elements;
        
        setPlayers({
            r: {
                name: values.redName.value || 'Red',
                type: values.redType.value
            },
            y: {
                name: values.yellowName.value || 'Yellow',
                type: values.yellowType.value
            }
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <input name="redName" placeholder="Red player name"/>
            <select name="redType">
                <option value="Human">Human</option>
                <option value="Bot">Bot</option>
            </select>
            <input name="yellowName" placeholder="Yellow player name"/>
            <select name="yellowType">
                <option value="Human">Human</option>
                <option value="Bot">Bot</option>
            </select>
            <button>Submit</button>
        </form>
    );
}

export default SettingsForm;
import React from 'react';

const ownerInfo = (props) => {
	return (
		<div className="ownerInfo">
			<div>
				<span>Email: </span>
				<input type='text' onChange={props.changeEmailValue} placeholder = {props.email} value={props.newEmail} />
				<button onClick={props.changeEmail}>Change</button>
			</div>

			<div>
				<span>User Name: </span>
				<input type='text' onChange={props.changeUserNameValue} placeholder = {props.username} value={props.newUserName} />
				<button onClick={props.changeUserName}>Change</button>
			</div>

			<div>
				<span>Password: </span>
				<input type='password' onChange={props.changePasswordValue} placeholder = {props.password} value={props.newPassword} />
				<button onClick={props.changePassword}>Change</button>
			</div>

		</div>
	)
}

export default ownerInfo
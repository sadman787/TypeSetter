import React from 'react';
import '../components/ProfileViewOtherUser.css';

const ProfileViewOtherUser = (props) => {
	return (

		<div className="otherUserView">
			<p>{props.userName}</p>
			<p>{props.postContent}</p>
		</div>
	)
}

export default ProfileViewOtherUser

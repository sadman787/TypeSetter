import React from 'react';
import './EachFeed.css';

import { Link } from 'react-router-dom'
import katex from 'katex'

const feed = (props) => {
    let typesetHtml = null
    if (props.isTypeset) {
      typesetHtml = katex.renderToString(props.postContent, {
        displayMode: true,
        throwOnError: false
      })
    }
	return (
		<div className="EachFeed">
            {props.profile ?<p>{props.username}</p>: <Link to={`profile/${props.userId}`}>
			<p>{props.username}</p>
            </Link>}
            {
              props.isTypeset
                ? <span className="katex" dangerouslySetInnerHTML={{ __html: typesetHtml }} />
                : <p>{props.postContent}</p>
            }

            {null ? 'sketchy ternary to stop showing comments link in single page view': null}
            {props.id !== undefined ? <p><Link to={`/tweet/${props.id}`}>Comments</Link></p> : null}
		</div>
	)
}

export default feed

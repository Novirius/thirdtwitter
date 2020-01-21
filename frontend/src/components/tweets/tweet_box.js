// src/components/tweets/tweet_box.js

import React from 'react';

class TweetBox extends React.Component {
  render() {
    return (
        <div className="box">
            <h3>{this.props.text}</h3>
        </div>
    );
  }
}

export default TweetBox;
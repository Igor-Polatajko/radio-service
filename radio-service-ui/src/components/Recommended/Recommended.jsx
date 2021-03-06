import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';

import PaginationLoader from '../PaginationLoader';

import * as actions from '../../redux/actions';

import './Recommended.scss'

const RECOMENDED_URL = process.env.REACT_APP_SITE_URL + '/api/v1/videos/recommended?page='
const DESCRIPTION_LENGTH = 1000;
const BG_URL = process.env.REACT_APP_SITE_URL + '/api/v1/backgrounds'

class Recommended extends React.Component {
  constructor(props) {
    super(props);

    this.fetchBackground();
    this.fetchVideos();

    this.fetchBackground = this.fetchBackground.bind(this);
    this.fetchVideos = this.fetchVideos.bind(this);
  }

  componentDidMount(){
    if(this.props.open){
      document.getElementById('menu').style.width = '0%';
      document.body.style.overflow = 'visible';
      this.props.turnOffHamburger();
    }
  }

  fetchBackground() {
    this.props.turnLoadingOn();

    axios.get(BG_URL)
    .then((response) => {
      this.props.turnLoadingOff();
      document.getElementById('content').style.backgroundImage = "url('" + response.data.recommendedVideosPage + "')";
    })
    .catch((errors) => {
      this.props.turnLoadingOff();
      console.error(errors)
    });
  }

  fetchVideos() {
    this.props.turnLoadingOn();

    axios.get(RECOMENDED_URL + this.props.currentPage)
    .then(response => {
      this.props.turnLoadingOff();
      // const videos = [...this.props.recommended, ...response.data.content];

      // console.log(response.data.pageNumber, response.data.totalPages)
      // if(response.data.pageNumber < response.data.totalPages) {
        this.props.setRecommended(response.data.content, this.props.currentPage)
      // }
      // if(response.data.pageNumber  >= response.data.totalPages-1) {
      //   this.props.setHasMore(false);
      // }
    })
  }

  render() {
    const { recommended, currentPage, hasMore } = this.props;

    const renderVideo = video => {
      return (
        <div className="video-card mb-4 p-3" key={video.id}>
          <h3 className="title mb-3 pb-2">{video.title}</h3>
          <div className="d-flex flex-column video">
            <iframe width="560"
                    height="315"
                    src={"https://www.youtube.com/embed/" + video.id}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="youtube-video"></iframe>

            <div className="description ml-2">{video.description.substring(0, DESCRIPTION_LENGTH)}</div>
          </div>
        </div>
      )
    };

    return (
      <div className="recommended-container">
        {/* <InfiniteScroll
          pageStart={0}
          loadMore={this.fetchVideos}
          hasMore={hasMore}
          loader={<PaginationLoader key={currentPage} />}
          useWindow={true}
          getScrollParent={() => this.props.scrollParentRef}
        > */}
          { recommended && recommended.length > 0 && recommended.map(video => renderVideo(video)) }
        {/* </InfiniteScroll> */}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentPage: state.videos.currentPage,
    recommended: state.videos.recommended,
    hasMore:     state.videos.hasMore,
    open: state.shared.open,

  }
};

const mapDispatchToProps = dispatch => ({
  turnOffHamburger: () => dispatch(actions.turnOffHamburger()),
  setRecommended: (recommended, currentPage) => dispatch(actions.setRecommended(recommended, currentPage)),
  setHasMore:     bool                       => dispatch(actions.setHasMore(bool)),
  turnLoadingOn:  ()                         => dispatch(actions.turnLoadingOn()),
  turnLoadingOff: ()                         => dispatch(actions.turnLoadingOff()),
});

Recommended.propTypes = {
  currentPage: PropTypes.number,
  recommended: PropTypes.array,
  hasMore:     PropTypes.bool,
  open: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(Recommended);

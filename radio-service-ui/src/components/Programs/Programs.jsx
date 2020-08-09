import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';

import PaginationLoader from '../PaginationLoader';

import * as actions from '../../redux/actions';
import './Programs.scss'

const PROGRAMS_URL = 'https://radio-service-api-stage.herokuapp.com/api/v1/programs'
const DESCRIPTION_LENGTH = 1000;

class Programs extends React.Component {
  constructor(props) {
    super(props);

    this.fetchPrograms(PROGRAMS_URL, 0, true)
    this.fetchNext = this.fetchNext.bind(this);
    this.fetchPrograms = this.fetchPrograms.bind(this);
  }

  fetchPrograms(url, currentPage = 0, initial=false) {
    initial && this.props.turnLoadingOn();

    axios.get(url + "?page=" + currentPage)
    .then((response) => {
      this.props.turnLoadingOff();

      this.props.setPrograms(
        response.data.content,
        response.data.pageNumber,
        response.data.totalPages,
      );
    })
    .catch((errors) => {
      initial && this.props.turnLoadingOff();
      console.error(errors)
    });
  }

  fetchNext(page) {
    console.log('fetching')
    this.fetchPrograms(PROGRAMS_URL, page, false)
  }

  render() {
    const { programs, currentPage, totalPages, } = this.props;

    const dayNamesShort = {
      'Понеділок': 'пн',
      'Вівторок': 'вт',
      'Середа': 'ср',
      'Четвер': 'чт',
      "П'ятниця": 'пт',
      'Субота': 'сб',
      'Неділя': 'нд',
    }

    const renderOccurrence = (occurence, last=false) => {
      return(
        <div className="occurence" key={occurence["dayOfWeek"]["nameUkr"]}>
          <span className="day">{dayNamesShort[occurence["dayOfWeek"]["nameUkr"]]}</span>
          <span className="time">
            ({occurence["timeRange"]["startTime"]} - {occurence["timeRange"]["endTime"]}){!last && "," + String.fromCharCode(160)}
          </span>
        </div>
      )
    }

    const renderProgram = program => {
      let occurences = program['scheduleOccurrences']

      return(
        <div className="program-card mb-4 p-3" key={program.id}>
          <h3 className="title mb-3 pb-2 d-flex flex-column">
            <div className="mb-2">
              {program.title}
            </div>
            <div className="d-flex occurences">
              {
                occurences.length > 0 &&
                occurences.map(occurence => renderOccurrence(occurence, (occurences.indexOf(occurence) == occurences.length -1)))
              }
            </div>
          </h3>

          <div className="d-flex">
            <img src={program.imageUrl} alt=""/>
            <div className="description ml-2">{program.description}</div>
          </div>
        </div>
      )
    }

    return (
      <div className="programs-container">
        {console.log(currentPage, totalPages)}
        <InfiniteScroll
          pageStart={0}
          loadMore={this.fetchNext}
          hasMore={totalPages > currentPage + 1}
          loader={<PaginationLoader key={currentPage} />}
        >
          { programs.length > 0 && programs.map(program => renderProgram(program)) }
        </InfiniteScroll>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentPage: state.programs.currentPage,
    totalPages:  state.programs.totalPages,
    programs:    state.programs.programs
  }
};

const mapDispatchToProps = dispatch => ({
  setPrograms: (programs, currentPage, totalPages) => dispatch(actions.setPrograms(programs, currentPage, totalPages)),
  turnLoadingOn:  () => dispatch(actions.turnLoadingOn()),
  turnLoadingOff: () => dispatch(actions.turnLoadingOff()),

});

Programs.propTypes = {
  currentPage: PropTypes.number,
  totalPages:  PropTypes.number,
  programs:    PropTypes.array,
}

export default connect(mapStateToProps, mapDispatchToProps)(Programs);

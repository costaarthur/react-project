import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  OpenButton,
  ClosedButton,
  AllButton,
  Pages,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    estado: 'open',
    page: 2,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { estado } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues?page={page}`, {
        params: {
          state: estado,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    console.log('oi');

    this.setState({ estado: 'open' });
  };

  handleInputChange = e => {
    this.setState({ estado: 'open' });
  };

  prevPage = () => { };

  nextPage = () => { };

  render() {
    const { repository, issues, loading, estado } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <OpenButton onSubmit={this.handleSubmit}>Open</OpenButton>
        <ClosedButton>Closed</ClosedButton>
        <AllButton>All</AllButton>
        {/* <input className="Open" type="button" value="Open" />
        <input className="Closed" type="button" value="Closed" />
        <input className="All" type="button" value="All" /> */}
        {/* <SubmitButton loading={loading} /> */}
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              {/* <li>{issue.state: open}</li> */}
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
                <p>{issue.state}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pages>
          <button>
            <FaArrowLeft size={22} onClick={this.prevPage} />
          </button>
          <button>
            <FaArrowRight size={22} onClick={this.nextPage} />
          </button>
        </Pages>
      </Container>
    );
  }
}

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
    estado: 'closed',
    page: 1,
    per_page: 3,
  };

  // Executado assim que o componente aparece em tela
  async componentDidMount() {
    const { match } = this.props;
    const { estado, page, per_page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues?page={page}`, {
        params: {
          state: estado,
          per_page,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  // Executado sempre que houver alterações nas props ou estado
  componentDidUpdate() { }

  // //  change pages /////
  prevPage = () => {
    const { page } = this.state;
    if (page === 1) return;
    this.setState({ page: page - 1 });
    console.log(this.state.page);
  };

  nextPage = () => {
    const { page } = this.state;
    this.setState({ page: +1 });
    console.log(page);
  };

  // /// set state (open/closed/all) /////
  setOpen = () => {
    this.setState({ estado: 'open' });
    console.log('oi');
  };

  setClosed = () => {
    this.setState({ estado: 'closed' });
  };

  setAll = () => {
    this.setState({ estado: 'all' });
  };

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

        <OpenButton onClick={() => this.setOpen} type="button">
          Open
        </OpenButton>
        <ClosedButton onClick={this.setClosed}>Closed</ClosedButton>
        <AllButton onClick={this.setAll}>All</AllButton>
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
                <p>{estado}</p>
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

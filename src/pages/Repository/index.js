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

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default class Repository extends Component {
  constructor() {
    super();
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      estado: 'closed',
      page: 1,
      perPage: 4,
    };
  }

  // Executado assim que o componente aparece em tela
  async componentDidMount() {
    this.getRepositories();
  }

  // Executado sempre que houver alterações nas props ou estado
  componentDidUpdate(_, prevState) {
    const { estado, page } = this.state;
    if (prevState.estado !== estado || prevState.page !== page) {
      this.getRepositories();
    }
  }

  async getRepositories() {
    const { match } = this.props;
    const { estado, page, perPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues?page=${page}`, {
        params: {
          state: estado,
          per_page: perPage,
          page,
        },
      }),
    ]);
    if (issues.data.length > 0) {
      this.setState({
        repository: repository.data,
        issues: issues.data,
        loading: false,
        estado,
        page,
        perPage,
      });
    }
    // else {
    //   this.setState({ page: page - 1 });
    // }
  }

  // //  change pages /////
  prevPage = () => {
    const { page } = this.state;
    if (page === 1) return;
    this.setState({ page: page - 1 });
  };

  nextPage = () => {
    const { page } = this.state;
    this.setState({ page: page + 1 });
  };

  // /// set state (open/closed/all) /////
  setEstado = estado => {
    this.setState({ estado });
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

        <OpenButton onClick={() => this.setEstado('open')}>Open</OpenButton>
        <ClosedButton onClick={() => this.setEstado('closed')}>
          Closed
        </ClosedButton>
        <AllButton onClick={() => this.setEstado('all')}>All</AllButton>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
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
          <button type="submit">
            <FaArrowLeft size={22} onClick={this.prevPage} />
          </button>
          <button type="submit">
            <FaArrowRight size={22} onClick={this.nextPage} />
          </button>
        </Pages>
      </Container>
    );
  }
}
Repository.propTypes = propTypes;

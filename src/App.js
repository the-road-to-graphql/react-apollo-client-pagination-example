import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import './App.css';

const GET_REPOSITORIES_OF_ORGANIZATION = gql`
  query($cursor: String) {
    organization(login: "the-road-to-learn-react") {
      repositories(after: $cursor, first: 2) {
        edges {
          node {
            id
            name
            url
            viewerHasStarred
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

const updateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    organization: {
      ...previousResult.organization,
      repositories: {
        ...previousResult.organization.repositories,
        ...fetchMoreResult.organization.repositories,
        edges: [
          ...previousResult.organization.repositories.edges,
          ...fetchMoreResult.organization.repositories.edges,
        ],
      },
    },
  };
};

const App = () => (
  <Query query={GET_REPOSITORIES_OF_ORGANIZATION}>
    {({ data: { organization }, loading, fetchMore }) => {
      if (loading || !organization) {
        return <div>Loading ...</div>;
      }

      return (
        <div>
          <Repositories repositories={organization.repositories} />

          {organization.repositories.pageInfo.hasNextPage && (
            <button
              type="button"
              onClick={() =>
                fetchMore({
                  variables: {
                    cursor:
                      organization.repositories.pageInfo.endCursor,
                  },
                  updateQuery,
                })
              }
            >
              More
            </button>
          )}
        </div>
      );
    }}
  </Query>
);

const Repositories = ({ repositories }) => (
  <ul>
    {repositories.edges.map(({ node }) => (
      <li key={node.id}>
        <a href={node.url}>{node.name}</a>
      </li>
    ))}
  </ul>
);

export default App;

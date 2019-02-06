import React from 'react';
import axios from 'axios';
import produce from 'immer';
import classNames from 'classnames';
import { Formik, Form, Field } from 'formik';

import Match from 'components/Match';

const apiPath = '/api/summoner';
const initialState = {
  summoner: '',
  matches: [],
  error: null
};

export const Context = React.createContext(initialState);

const reducer = (state, { type, payload }) =>
  produce(state, draft => {
    draft[type] = payload;
  });

export default () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { matches, error } = state;

  const fetchMatches = async (summoner = state.summoner) => {
    await dispatch({ type: 'error', payload: null });
    await dispatch({ type: 'summoner', payload: summoner });
    try {
      // fetch summoner
      const { data } = await axios.get(`${apiPath}?name=${summoner}`);
      await dispatch({
        type: 'matches',
        payload: data.matches
      });
    } catch (e) {
      dispatch({ type: 'error', payload: 'Could not fetch summoner matches.' });
      console.log(e);
    }
  };

  return (
    <Context.Provider value={{ ...state, dispatch }}>
      <div className="app">
        <Formik
          initialValues={{ summoner: '' }}
          onSubmit={async (values, { setSubmitting }) => {
            const { summoner } = values;
            if (summoner !== state.summoner) {
              await dispatch({ type: 'matches', payload: [] });
              await fetchMatches(summoner);
            }
            setSubmitting(false);
          }}>
          {({ isSubmitting }) => (
            <Form className={classNames({submitting: isSubmitting})}>
              <div className="inputWrapper">
                <Field
                  type="text"
                  name="summoner"
                  placeholder="Summoner Name"
                />
                <span className="line" />
              </div>
              <div className="btnWrapper">
                <button type="submit" disabled={isSubmitting}>
                  Search
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <main role="main">
          {error && <h2 className="error">{error}</h2>}
          {matches.map(({ gameId }) => (
            <Match key={gameId} matchId={gameId} />
          ))}
        </main>
      </div>
    </Context.Provider>
  );
};

import React from 'react';
import axios from 'axios';
import produce from 'immer';
import { Formik, Form, Field } from 'formik';

import Match from 'components/Match';

const apiPath = '/api/summoner';
const initialState = {
  summoner: '',
  matches: []
};

export const Context = React.createContext(initialState);

const reducer = (state, { type, payload }) =>
  produce(state, draft => {
    if (type === 'merge') {
      draft = {
        ...state,
        ...payload
      };
    } else {
      draft[type] = payload;
    }
  });

export default () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { matches } = state;

  return (
    <Context.Provider value={{ ...state, dispatch }}>
      <div className="app">
        <Formik
          initialValues={{ summoner: '' }}
          onSubmit={async (values, { setSubmitting }) => {
            const { summoner } = values;
            if (summoner !== state.summoner) {
              await dispatch({
                type: 'merge',
                payload: {
                  summoner,
                  matches: []
                }
              });
              // dispatch({ type: 'summoner', payload: summoner });
              try {
                // fetch summoner
                const { data } = await axios.get(`${apiPath}?name=${summoner}`);
                const { matches } = data;
                await dispatch({ type: 'matches', payload: matches });
              } catch (e) {
                console.log(e);
              }
            }
            setSubmitting(false);
          }}>
          {({ isSubmitting }) => (
            <Form>
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
          {matches.map(({ gameId }) => (
            <Match key={gameId} matchId={gameId} />
          ))}
        </main>
      </div>
    </Context.Provider>
  );
};

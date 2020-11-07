import React, {useContext} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom'
import Signin from './component/Signin'
import Home from './component/Home'
import {firebaseAuth} from './provider/AuthProvider'

function App() {
  const { token } = useContext(firebaseAuth)
  //console.log(token)
  return (
    <>
    {/* switch allows switching which components render.  */}
      <Switch>
        {/* route allows you to render by url path */}

        <Route exact path='/' render={rProps => token === null ? <Signin /> : <Home />} />
        <Route exact path='/signin' component={Signin} />
      </Switch>
    </>
  );
}

export default App;

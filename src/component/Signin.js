// add useContext
import React, {useContext} from 'react';
import {firebaseAuth} from '../provider/AuthProvider'

const Signin = () => {


  const {handleSignin, inputs, setInputs, errors} = useContext(firebaseAuth)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('handleSubmit')
    handleSignin()
    
  }
  const handleChange = e => {
    const {name, value} = e.target
    console.log(inputs)
    setInputs(prev => ({...prev, [name]: value}))
  }

  return (
    <div className="App signin">
      <h1 className="">Sign In</h1>
      <form className="" onSubmit={handleSubmit}>
        <input type="email" onChange={handleChange} name="email" placeholder='email' value={inputs.email} />
        <input type="password" onChange={handleChange} name="password" placeholder='password' value={inputs.password} />
        <button className="button green">signin</button>
        {errors.length > 0 ? errors.map(error => <p style={{color: 'red'}}>{error}</p> ) : null}
      </form>
    </div>
  );
};

export default Signin;

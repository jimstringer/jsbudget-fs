import React, {useContext, useState, useEffect} from 'react';
import {firebaseAuth} from '../provider/AuthProvider'
import {db} from '../firebase/firebaseIndex'
import Transaction from './Transaction.js'

/**
 * Returns todays date as string in format YYYY-MM-DD
 * @return {string}
 */
function getTodaysDateString() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1;
  const yyyy = today.getFullYear();
  if(dd<10)
  {
      dd=`0${dd}`;
  }

  if(mm<10)
  {
      mm=`0${mm}`;
  }
  today = `${yyyy}-${mm}-${dd}`;
  console.log(today);
  return today;
}

const Home = (props) => {

  const {handleSignout,} = useContext(firebaseAuth)
  const [loading, setLoading] = useState(true);
  const [trxItems, setTrxItems] = useState([]);
  const [expenseText, setExpenseText] = useState("");
  const [expenseDate, setExpenseDate] = useState(getTodaysDateString);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseCat, setExpenseCat] = useState("Alcohol");

  const catitems = ["Alcohol","Auto Gas","Auto Maint","Boat","Camping","Clothing","Dine Out","Exercise","Fishing","Grandkids" ,"Grocery","House","Lotto","Misc","Prescription"];

  const handleExpenseTextChange = (e) => {
    setExpenseText(e.target.value);
  };
  const handleExpenseDateChange = (e) => {
    setExpenseDate(e.target.value);
  };
  const handleExpenseAmountChange = (e) => {
    setExpenseAmount(e.target.value);
  };
  const handleExpenseCatChange = (e) => {
    setExpenseCat(e.target.value);
  };
  
  useEffect(()=>{
    var startfulldate = new Date();
    const trxRef = db.collection('transactions');
    trxRef.where('TrxDate', '<=', startfulldate)
      .orderBy('TrxDate','desc').limit(5)
      .get()
     .then((querySnapshot) => {
        if (querySnapshot.empty) {
          console.log('No matching documents.');
          return;
        }
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrxItems(data)
        console.log("Transactions: ", data);
    })
  },[loading]);

  const handleAddTransaction = (e) => {
    //sendTransaction({ Comment: expenseText, TrxDate: expenseDate,CatId: Number(expenseCat) , Amount: Number(expenseAmount) });
    console.log({ Comment: expenseText, TrxDate: expenseDate,CatId: expenseCat , Amount: Number(expenseAmount) })
    // Add a new document in collection "cities"
    //db.collection("transactions").doc().set({
    db.collection("transactions").add({
      Comment: expenseText,
      TrxDate: new Date(expenseDate),
      Category: expenseCat ,
      Amount: Number(expenseAmount),
      Income: false,
      synced: false
    })
    .then(function(ref) {
        //console.log("Document successfully written with TrxDate! ",ref.TrxDate.toDate().toDateString());
        console.log("Document successfully written with TrxDate! ",ref);
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
    setExpenseAmount(0);
    setExpenseText("");
    setLoading(!loading)
  };


  return (
    <div className="App">
      <div>
        <h1 className="heading">Add Transaction</h1>
        <button className="heading red" onClick={handleSignout}>sign out </button>
      </div>
      <div className="add-transaction">
        <select
          value={expenseCat}
          onChange={handleExpenseCatChange}
        >
          {catitems.map(( value ) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="expenseDate"
          value={expenseDate}
          required
          pattern="\d{4}-\d{2}-\d{2}"
          autoComplete="off"
          onChange={handleExpenseDateChange}
        />
        <input
          type="number"
          name="expenseAmount"
          value={expenseAmount}
          placeholder="Amount"
          autoComplete="off"
          onChange={handleExpenseAmountChange}
        />
        <input
          type="text"
          name="expenseText"
          value={expenseText}
          placeholder="Add Expense Comment..."
          autoComplete="off"
          onChange={handleExpenseTextChange}
        />
        <button className="button green" type="submit"
          disabled={!expenseText || !expenseAmount || !expenseDate}
          onClick={handleAddTransaction}
        >
          submit
        </button>
      </div>
      <div className="transactions">
        <h1>Last 5 Transactions</h1>
          <ul className="transaction-list">
            {trxItems.length === 0 ? <ul>Loading</ul> : trxItems.map(
              Taction => <li key={Taction.id}><span>{
                Taction.TrxDate.toDate().getFullYear()+"-"+ Taction.TrxDate.toDate().getMonth() +"-"+Taction.TrxDate.toDate().getDate()
              }</span><span>{Taction.Category}</span><span>{Taction.Amount}</span></li>
            )}
          </ul>

      </div>
    </div>
  );
};

export default Home;

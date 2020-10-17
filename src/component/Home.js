import React, {useContext, useState, useEffect} from 'react';
import {firebaseAuth} from '../provider/AuthProvider'
import {db} from '../firebase/firebaseIndex'

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
  const [expenseCat, setExpenseCat] = useState("Empty");

  const catitems = ["Empty","Alcohol","Autopac","Auto Gas","Auto License","Auto Maint","Boat","Camping","Clothing","Dine Out","Exercise","Fishing","Grandkids" ,"Grocery","Holiday","House","Lotto","Misc","Prescription"];

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
    //it seems that new Date(YYYY-MM-DD) creates a UTC timestamp at 00:00:00 so 2020-10-22 is 2020-10-21 19:00:00 GMT-5
    //What I want is the date string I put in for current timezone, but still have firestore index by date
    //firestore stores a UTC timestamp
    //These both give the same datetime
    const utcdate = new Date (Date.UTC(expenseDate.slice(0,4),parseInt(expenseDate.slice(5,7))-1,parseInt(expenseDate.slice(8,10))))
    //console.log(utcdate.toUTCString())
    //console.log(new Date(expenseDate))
    //need to add time so it will be created as localtime
    //console.log(new Date(expenseDate+"T00:00:00"))
    //With time works on the desktop browser but not on the iphone.
    //New Plan, store TrxDate as UTC using Date.UTC 
    //add a string field StrDate that stores 2020-10-24
    //query using UTC 
    db.collection("transactions").add({
      Comment: expenseText,
      //TrxDate: new Date(expenseDate+"T00:00:00"),
      TrxDate:utcdate,
      StrDate: expenseDate,
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
    //
    setExpenseAmount(0);
    setExpenseText("");
    setExpenseCat("Empty")
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
          disabled={!expenseText || !expenseAmount || !expenseDate || expenseCat === 'Empty'}
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
                Taction.TrxDate.toDate().toDateString()
              }</span><span>{Taction.Category}</span><span>{Taction.Amount}</span></li>
            )}
          </ul>

      </div>
    </div>
  );
};

export default Home;

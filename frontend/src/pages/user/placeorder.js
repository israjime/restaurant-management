import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { Segment, Tab, TabPane } from "semantic-ui-react";
import { CustomerContext } from "../../components/contextAPI/customerContext";
import NavBar from "../../components/user/navBar/userNavBar.component";
import Orders from "./Orders";
import "./placeorder.css";

const PlaceOrderPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCartItems] = useState([]);
  const [cartId, setCartId] = useState([]);
  const [total, setTotal] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupOrder, setShowPopupOrder] = useState(false);

  const [customers, setCustomers] = useState([]);
  const { customer } = useContext(CustomerContext);
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleResetDateTime = () => {
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/customers");
        console.log("Response:", response.data);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8000/orders");
        const result = response.data.filter(
          (order) => order.customerId === customer._id
        );
        setOrders(result);
      } catch (error) {
        console.error("Error fetching orders", error);
      }
    };

    fetchOrders();
  }, [customer._id]);

  useEffect(() => {
    const fetchRestaurantAndMenuItems = async () => {
      try {
        const restaurantResponse = await axios.get(
          `http://localhost:8000/restaurants/${restaurantId}`
        );
        const fetchedRestaurant = restaurantResponse.data[0];
        console.log("Fetched Restaurant:", fetchedRestaurant);
        setRestaurant(fetchedRestaurant);

        const menuItemsData = await Promise.all(
          fetchedRestaurant.menuItems.map(async (itemId) => {
            const itemResponse = await axios.get(
              `http://localhost:8000/menus/${itemId}`
            );
            const menuItem = itemResponse.data[0];
            console.log("Fetched Menu Item:", menuItem);
            return menuItem;
          })
        );

        const filteredMenuItems = menuItemsData.filter(
          (item) => item.status === true
        );
        console.log("Filtered Menu Items Data:", filteredMenuItems);
        setMenuItems(filteredMenuItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchRestaurantAndMenuItems();
  }, [restaurantId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleAdd = async (item, itemPrice) => {
    cart.push(item);
    cartId.push(item._id);
    addPrice(itemPrice);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const handleRemove = async (item, itemPrice) => {
    const index = cart.indexOf(item);
    const newCart = [...cart];
    newCart.splice(index, 1);
    const index1 = cartId.indexOf(item._id);
    const newCart1 = [...cart];
    newCart1.splice(index1, 1);
    subPrice(itemPrice);
    setCartItems(newCart);
    setCartId(newCart1);
  };

  const addPrice = async (itemPrice) => {
    let cost = 0;
    cost = total + itemPrice;
    cost = Math.round(cost * 100) / 100;
    setTotal(cost);
  };

  const subPrice = async (itemPrice) => {
    let cost = 0;
    cost = total - itemPrice;
    cost = Math.round(cost * 100) / 100;
    if (cost <= 0) {
      setTotal(0);
    } else {
      setTotal(cost);
    }
  };

  const handleOrder = async () => {
    const cartMenuItemIds = [];

    cart.forEach((cartItem) => {
      // Find the menu item in menuItems array
      const menuItem = menuItems.find((item) => item._id === cartItem._id);
      if (menuItem) {
        cartMenuItemIds.push(menuItem._id);
      }
    });

    const data = customers.find((item) => item._id === customer._id);
    const customerId = data._id;
    const sumPrice = total;
    const pickUpDate = selectedDate;
    const pickUpTime = selectedTime;

    axios
      .post("http://localhost:8000/orders", {
        customerId,
        restaurantId,
        menuItems: cartMenuItemIds,
        sumPrice,
        status: "Ordered",
        pickUpDate,
        pickUpTime,
      })
      .then((result) => {
        console.log("Document inserted successfully", result.data);
        setCartItems([]);
        setTotal(0);
        setShowPopupOrder(true);
        setTimeout(() => {
          setShowPopupOrder(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to insert document", err);
      });
    handleResetDateTime();
  };

  return (
    <div className="mainContainer">
      <NavBar />
      <div className="table">
        <Tab
          className="tabs"
          menu={{ fluid: true, vertical: true }}
          menuPosition="left"
          panes={[
            {
              menuItem: "Menu",
              render: () => (
                <TabPane style={{ overflowY: "auto", height: "85vh" }}>
                  <div className="container1">
                    <h1>{restaurant.name}</h1>
                    <p>Address: {restaurant.address}</p>
                    <p>Contact: {restaurant.phone}</p>
                    <div className="ui divider"></div>
                    <h2 className="ui center aligned header">Menu</h2>
                    {menuItems.length > 0 ? (
                      <ul>
                        {menuItems.map((menuItem) => (
                            <Segment key={menuItem?._id}>
                              <div className="menu-item">
                                <img src={menuItem?.image} alt={menuItem?.name} className="ui small image"/>
                                <div className="content">
                                  <h3>
                                    {menuItem?.name}, ${menuItem?.price}
                                  </h3>
                                  <p>{menuItem?.description}</p>
                                </div>
                              </div>
                              {cart.some((item) => item._id === menuItem._id) ? (
                                  <div className="ui buttons">
                                    <button
                                        className="ui green vertical animated button"
                                        tabIndex="0"
                                        onClick={(e) =>
                                            handleAdd(menuItem, menuItem.price, e)
                                        }
                                    >
                                      <div className="hidden content">Add</div>
                                      <div className="visible content">
                                        <i className="shop icon"></i>
                                      </div>
                                    </button>
                                    <button
                                        className="ui red vertical animated button"
                                        tabIndex="0"
                                        onClick={(e) =>
                                            handleRemove(menuItem, menuItem.price, e)
                                        }
                                    >
                                      <div className="hidden content">Remove</div>
                                      <div className="visible content">
                                        <i className="trash alternate outline icon"></i>
                                      </div>
                                    </button>
                                  </div>
                              ) : (
                                  <button
                                      className="ui green vertical animated button"
                                      tabIndex="0"
                                      onClick={(e) =>
                                          handleAdd(menuItem, menuItem.price, e)
                                      }
                                  >
                                    <div className="hidden content">Add</div>
                                    <div className="visible content">
                                      <i className="shop icon"></i>
                                    </div>
                                  </button>
                              )}
                            </Segment>
                        ))}
                      </ul>
                    ) : (
                        <p>No menu items available</p>
                    )}
                  </div>
                </TabPane>
              ), // This can be imported from another file, take a look at admin/menuitems/adminmenu.component.jsx
            },
            {
              menuItem: `Cart - $${total} (🛒 ${cart.length})`,
              render: () => (
                <TabPane style={{ overflowY: "auto", height: "85vh" }}>
                  {" "}
                  <div className="container1">
                    <h1>{restaurant.name}</h1>
                    <p>Address: {restaurant.address}</p>
                    <p>Contact: {restaurant.phone}</p>
                    <div class="ui divider"></div>
                    <h2 class="ui center aligned header">Cart</h2>
                    {cart.length > 0 ? (
                      <ul>
                        {cart.map((item) => (
                          <Segment key={item?._id}>
                            <h3>
                              {item?.name}, ${item?.price}
                            </h3>
                            <p>{item?.description}</p>
                            <div
                              class="ui red vertical button"
                              tabindex="0"
                              onClick={(e) => handleRemove(item, item.price, e)}
                            >
                              Remove
                            </div>
                          </Segment>
                        ))}
                      </ul>
                    ) : (
                      <p>No Items In Cart</p>
                    )}
                    <div className="date-time-container">
                      <div className="date-picker-container">
                        <label>Select Date:</label>
                        <div
                          style={{
                            border: "1px solid #000",
                            borderRadius: "5px",
                            padding: "5px",
                            width: "150px",
                          }}
                        >
                          <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                          />
                        </div>
                      </div>
                      <div className="time-picker-container">
                        <label style={{ paddingLeft: "30px" }}>
                          Select Time:
                        </label>
                        <div
                          style={{
                            border: "1px solid #000",
                            borderRadius: "5px",
                            padding: "5px",
                            width: "150px",
                            marginLeft: "20px",
                          }}
                        >
                          <input
                            type="time"
                            value={selectedTime}
                            onChange={handleTimeChange}
                          />
                        </div>
                      </div>
                    </div>
                    <h3>Total: ${total}</h3>

                    <button
                      className="ui toggle button active"
                      onClick={handleOrder}
                    >
                      Checkout
                    </button>
                  </div>
                </TabPane>
              ),
            },
            {
              menuItem: "History",
              render: () => (
                <TabPane style={{ overflowY: "auto", height: "85vh" }}>
                  {" "}
                  <div className="container1">
                    <h2 className="ui center aligned header">Orders</h2>
                    <Orders customerId={customer._id} />
                  </div>
                </TabPane>
              ),
            },
          ]}
        />
        {showPopup && (
          <div className="popup">Item successfully added to cart</div>
        )}
        {showPopupOrder && (
          <div className="popup">Order successfully created</div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrderPage;

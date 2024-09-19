import { useState, useEffect, useRef } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import "./style.css";
import api from "../../service/api";

function Home() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const inputName = useRef();
  const inputEmail = useRef();
  const inputAge = useRef();

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch users from API based on debounced search term
  useEffect(() => {
    const getUsers = async () => {
      let url = "/users";
      if (debouncedSearchTerm) {
        url += `?name=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      const usersFromApi = await api.get(url);
      setUsers(usersFromApi.data);
    };

    getUsers();
  }, [debouncedSearchTerm]);

  // Delete a user
  const deleteUsers = async (id) => {
    await api.delete(`/users/${id}`);
    // Refresh the user list after deletion
    const url = debouncedSearchTerm ? `/users?name=${encodeURIComponent(debouncedSearchTerm)}` : "/users";
    const usersFromApi = await api.get(url);
    setUsers(usersFromApi.data);
  };

  // Create a new user
  const createUsers = async () => {
    await api.post("/users", {
      name: inputName.current.value,
      age: inputAge.current.value,
      email: inputEmail.current.value,
    });

    handleCloseForm();
    // Refresh the user list after creation
    const url = debouncedSearchTerm ? `/users?name=${encodeURIComponent(debouncedSearchTerm)}` : "/users";
    const usersFromApi = await api.get(url);
    setUsers(usersFromApi.data);
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="container">
      <div className="container-title">
        <h1>Listagem de Usuários</h1>
      </div>

      <div className="button-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button type="button" onClick={handleShowForm}>
          + Add
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              type="button"
              className="close-modal"
              onClick={handleCloseForm}
            >
              <FaTimes />
            </button>
            <form>
              <h1>Cadastro de Usuário</h1>
              <input
                name="name"
                type="text"
                placeholder="Nome"
                ref={inputName}
              />
              <input
                name="age"
                type="number"
                placeholder="Idade"
                ref={inputAge}
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                ref={inputEmail}
              />
              <button type="button" onClick={createUsers}>
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      )}

      {users.map((user) => (
        <div key={user.id} className="card">
          <div>
            <p>
              Nome: <span>{user.name}</span>
            </p>
            <p>
              Idade: <span>{user.age}</span>
            </p>
            <p>
              E-mail: <span>{user.email}</span>
            </p>
          </div>
          <div>
            <button
              type="button"
              className="delete-button"
              onClick={() => deleteUsers(user.id)}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;

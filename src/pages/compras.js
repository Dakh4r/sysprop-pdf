import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
  Button,
} from "reactstrap";
import Sidebar from "../components/sidebar";
import Cookies from "universal-cookie";

const cookies = new Cookies()

async function agregarProveedor(
  ruta,
  nombre,
  rif,
  telefono,
  direccion,
  correo
) {
  if (correo.length === 0 ){
    alert("Correo  Invalido");
    return;
  }
  if (!nombre || !rif || !telefono || !direccion || !correo) {
    alert("Todos los campos son obligatorios");
    return;
  }
  if (rif.length < 8 || rif.length > 11) {
    alert("RIF Invalida");
    return;
  }
  if (nombre.length < 3 || nombre.length > 64) {
    alert("Nombre Invalido");
    return;
  }
  if (telefono.length <= 10 || telefono.length >= 12) {
    alert("Telefono Invalida");
    return;
  }
  const clientes = await axios.get(ruta);
  const clienteExistente = clientes.data.filter(
    (cliente) => cliente.cedula === rif
  );
  if (clienteExistente.length > 0) {
    alert("Este rif ya se encuentra registrado.");
    return;
  }
  
  await axios
    .post(ruta, {
      nombre: nombre,
      rif: rif,
      telefono: telefono,
      direccion: direccion,
      correo: correo,
    })
    .then((res) => console.log("posting data", res))
    .catch((err) => console.log(err));

  window.location.reload();
}

async function agregarVenta(idUsuario, idCliente, listaArticulos, listaCantidades) {
  try {
    await axios.post("https://sysprop-production.up.railway.app/ventas/registrar", {
      idusuario: idUsuario,
      idcliente: idCliente,
      articulos: listaArticulos,
      cantidades: listaCantidades,
    });
    console.log("Venta registrada correctamente");
    window.location.reload();
  } catch (error) {
    console.log("Error al registrar la venta:", error);
    alert(`Ocurrió un error al registrar la venta. ${error.response.data.message}`);
  }
}



var actualCliente = {
  nombre: "Nombre de cliente",
  cedula: "",
  id: 0,
}

var articulosSeleccionados = []
var articulosCantidades = []

const usuarioActual = cookies.get("id")

function Ventas() {
  const [show, setShow] = useState(false);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false)
  const [confirmarVenta, setConfirmarVenta] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null);
  const [nombreCliente, setNombreCliente] = useState(null);
  const Utensilios = "Utensilios";

  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    document.getElementById('rif').value = selectedOption.value;
    actualCliente = clientes.find(function (cliente) {
      return cliente.rif === selectedOption.value
    })
  };

  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");

  const [detalleProductos, setDetalleProductos] = useState([]);
  const [cantidadesProductos, setCantidadesProductos] = useState([])
  const [clientes, setClientes] = useState([])

  const handleModalSeleccionar = () => setShowModal(true);
  const handleModalAgregar = () => setShowModal(2);
  const closeModal = () => setShowModal(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleConfirm = () => setConfirmarVenta(true);
  const handleConfirmClose = () => setConfirmarVenta(false);

  useEffect(() => {
    axios
      .get("https://sysprop-production.up.railway.app/Articulos")
      .then((response) => {
        setProductos(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    // Peticion GET a Clientes
    fetch("https://sysprop-production.up.railway.app/proveedores")
      .then((response) => response.json())
      .then((data) => {
        setClientes(data);
      })
  }, []);

  

  const [action, setAction] = useState(1); // El estado 1 define que el Modal será utilizado para Agregar un cliente
  const handleAgregar = () => setAction(1);

  useEffect(() => {
    const selectedProductObjects = productos.filter((producto) =>
      selectedProducts.includes(producto.id)
    );
    const total = selectedProductObjects.reduce(
      (acc, producto) => acc + producto.cantidad * producto.precio,
      0
    );
    setTotal(total);
  }, [selectedProducts, productos, handleSelectChange]);

  const handleCheck = (productId, checked) => {
    setSelectedProducts((prevSelectedProducts) => {
      if (checked) {
        // Checkbox is checked, add product to selected products
        const productoSeleccionado = productos.find((p) => p.id === productId);
        const cantidad = productoSeleccionado.cantidad || 1
        const newDetalleProductos = [
          ...detalleProductos,
          { ...productoSeleccionado, cantidad: productoSeleccionado.cantidad },
        ];
        setDetalleProductos(newDetalleProductos);

        const nuevosDetalles = [...detalleProductos];
        const detalleIndex = nuevosDetalles.findIndex((p) => p.id === productoSeleccionado.id);
        if (detalleIndex !== -1) {
          nuevosDetalles[detalleIndex].cantidad = productoSeleccionado.cantidad;
        } else {
          nuevosDetalles.push({ ...productoSeleccionado, cantidad: productoSeleccionado.cantidad });
        }
        setDetalleProductos(nuevosDetalles);
        return [...prevSelectedProducts, productId];
      } else {
        // Checkbox is unchecked, remove product from selected products
        const newDetalleProductos = detalleProductos.filter((p) => p.id !== productId);
        setDetalleProductos(newDetalleProductos);
        return prevSelectedProducts.filter((id) => id !== productId);
      }
    });
  };






  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleInputChange = (event) => {
    const { value } = event.target;
    const regex = /^[a-zñA-ZÑ\s]*$/;
    if (regex.test(value) && value.length <= 64) {
      setNombre(value);
    } else if (!value) {
      setNombre("");
    }
  };

  function agregarClick() {
    handleAgregar();
    handleShow();
  }



  /*************VALIDAR CEDULA*******************/

  const validarRif = (event) => {
    const { value } = event.target;
    const regex = /^[0-9]*$/;
    if (regex.test(value) && value.length <= 12) {
      setRif(value);
    } else if (!value) {
      setRif("");
    }
  };





  /******************************************/
  /*************VALIDAR TELEFONO*******************/

  const validarTelefono = (event) => {
    const { value } = event.target;
    const regex = /^[0-9]*$/;
    if (regex.test(value) && value.length <= 11) {
      setTelefono(value);
    } else if (!value) {
      setTelefono("");
    }
  };

  /******************************************/


  const preConfirmar = async () => {
    if ((actualCliente.id > 0) && (detalleProductos.length > 0)) {
      {
        detalleProductos.map((producto) => {
          articulosSeleccionados.push(producto.nombre)
          articulosCantidades.push(parseInt(producto.cantidad))
        })
      }
      handleConfirm() // Redirecciona al Modal de Confirmación
    } else if (actualCliente.id === 0) {
      alert("Se debe seleccionar un cliente")
    } else if (detalleProductos.length === 0) {
      alert("No se han seleccionado articulos ")
    }

  }

  return (
    <>
      <Sidebar />
      <div>
        <div id="cuerpo">
          <div className="m-4 row">
            <h3>Registro de venta</h3>
            <div className="col-6">
              <Button color="primary">Visualizar Ventas</Button>
            </div>
          </div>
          <Row>
            <Col sm={8}>
              <Row className="mb-2 mt-5">
                <Col sm={12}>
                  <Card>
                    <CardHeader
                      style={{ backgroundColor: "#4e73df", color: "white" }}
                    >
                      Cliente
                    </CardHeader>
                    <CardBody>
                      <Row className="mt-2">
                        <Col>
                          <Button color="success" onClick={agregarClick}>
                            Agregar Cliente
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={6}>
                          <FormGroup>
                            <Label>Nombre</Label>
                            <Select
                              filterOption={(option, searchText) =>
                                option.label
                                  .toLowerCase()
                                  .includes(searchText.toLowerCase())
                              }
                              options={clientes.map((cliente) => ({
                                value: cliente.rif,
                                label: cliente.nombre,
                              }))}
                              placeholder="Seleccione un cliente"
                              onChange={handleSelectChange} // Agregamos el manejador de eventos
                            />
                          </FormGroup>
                        </Col>
                        <Col sm={6}>
                          <FormGroup>
                            <Label>Cédula</Label>
                            <Input bsSize="sm" id="rif" disabled="true" />
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col sm={12}>
                  <Card>
                    <CardHeader
                      style={{ backgroundColor: "#4e73df", color: "white" }}
                    >
                      Productos
                    </CardHeader>
                    <CardBody>
                      <Row className="mb-2 ">
                        <Col sm={12}>
                          <FormGroup>
                            <Input
                              placeholder="Busque su producto aqui..."
                              bsSize="sm"
                              value={busqueda}
                              onChange={(e) => setBusqueda(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <Table striped size="sm">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio c/u</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosFiltrados.filter(uten => uten.categoria === Utensilios).map((producto) => (
                                <tr key={producto.id}>
                                  <td>
                                    <Input
                                      type="checkbox"
                                      bsSize="md"
                                      checked={selectedProducts.includes(producto.id)}
                                      onChange={(e) => handleCheck(producto.id, e.target.checked)}
                                    />
                                  </td>
                                  <td>{producto.nombre}</td>
                                  <td>
                                    <FormGroup>
                                      <Input
                                        maxLength={8}
                                        type="text"
                                        defaultValue={producto.cantidad}
                                        onChange={(e) => {
                                          const newValue = e.target.value;

                                          if (
                                            selectedProducts.includes(producto.id) &&
                                            (newValue === "" || newValue > 1)
                                          ) {
                                            const nuevosProductos = [...productos];
                                            const index = nuevosProductos.indexOf(producto);
                                            nuevosProductos[index] = {
                                              ...producto,
                                              cantidad: newValue || 1,
                                            };
                                            setProductos(nuevosProductos);

                                            const nuevosDetalles = [...detalleProductos];
                                            const detalleIndex = nuevosDetalles.findIndex(
                                              (p) => p.id === producto.id
                                            );
                                            if (detalleIndex !== -1) {
                                              nuevosDetalles[detalleIndex].cantidad = newValue;
                                            } else {
                                              nuevosDetalles.push({
                                                ...producto,
                                                cantidad: newValue,
                                              });
                                            }
                                            setDetalleProductos(nuevosDetalles);
                                          } else {
                                            // Si el valor ingresado no es una cadena vacía o mayor a 1, se asigna el valor 1 al input
                                            e.target.value = 1;
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          // Se valida que no se escriba el símbolo "-"
                                          if (e.key === "-") {
                                            e.preventDefault();
                                          }
                                          // Expresión regular para validar si el valor ingresado cumple con la condición de permitir el número 0 solo si está seguido por otro número
                                          const regex = /[1-9]\d*/;
                                          if (!regex.test(e.target.value + e.key)) {
                                            e.preventDefault();
                                          }
                                        }}

                                      />

                                    </FormGroup>
                                  </td>
                                  <td>
                                    <span>{producto.precio + " Bs."}</span>
                                  </td>
                                  <td>
                                    {producto.cantidad * producto.precio +
                                      " Bs."}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>

            <Col sm={4} className="detalle-venta">
              <div className="sticky-top">
                <Row className="mb-2 mx-2">
                  <Col sm={12}>
                    <Card className="detalle-venta">
                      <CardHeader
                        style={{ backgroundColor: "#4e73df", color: "white" }}
                      >
                        Detalle
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col sm={12}>
                            <Table size="sm">
                              <tbody>
                                <tr>
                                  <td className="fw-semibold">Artí­culo</td>
                                  <td className="fw-semibold">Cantidad</td>
                                  <td className="fw-semibold">Precio</td>
                                </tr>
                                {detalleProductos.map((producto) => (
                                  <tr key={producto.id}>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.cantidad}</td>
                                    <td>{producto.precio}</td>
                                  </tr>
                                ))}
                                <tr>
                                  <td>Total:</td>
                                  <td>{total}</td>
                                </tr>
                              </tbody>
                            </Table>
                          </Col>
                        </Row>
                        <Row className="mx-2">
                          <Col sm={12}>
                            <Card>
                              <CardBody>
                                <Button
                                  color="success"
                                  block
                                  onClick={preConfirmar}
                                >
                                  <i className="fas fa-money-check"></i>{" "}
                                  Registrar Venta
                                </Button>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>

        {/* MODAL DE CONFIRMAR VENTA */}
        <Modal
          className="Modal-SeleccionarCliente"
          show={confirmarVenta}
          onHide={handleConfirmClose}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmación de Venta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column">
              <span>{`Cliente: ${actualCliente.nombre}`}</span>
              <span>{`Cédula: ${actualCliente.rif}`}</span>
            </div>
            <Card className="detalle-venta">
              <CardHeader
                style={{ backgroundColor: "#4e73df", color: "white" }}
              >
                Detalles
              </CardHeader>
              <CardBody>
                <Row>
                  <Col sm={12}>
                    <Table size="sm">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Artí­culo</td>
                          <td className="fw-semibold">Cantidad</td>
                          <td className="fw-semibold">Precio</td>
                        </tr>
                        {detalleProductos.map((producto) => (
                          <tr key={producto.id}>
                            <td>{producto.nombre}</td>
                            <td>{producto.cantidad || 1}</td>
                            <td>{producto.precio}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="fw-semibold">Total:</td>
                          <td></td>
                          <td className="fw-semibold">{total}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <button
              id="registrarVenta"
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={
                () => agregarVenta(usuarioActual, actualCliente.id, articulosSeleccionados, articulosCantidades)
              }
            >
              Registrar venta
            </button>
            <button
              id="cerrar"
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={function cancelarVenta() {
                articulosSeleccionados = []
                articulosCantidades = []
                handleConfirmClose()
              }}
            >
              Cancelar
            </button>
          </Modal.Body>
        </Modal>

        {/* MODAL DE AGREGAR NUEVO USUARIO */}
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === 1 ? "Agregar cliente" : "Modificar cliente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label for="nombre" className="form-label">
                  Nombre:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  defaultValue={action === 1 ? "" : nombre}
                  required
                  value={nombre}
                  onChange={handleInputChange}
                  minLength={3}
                />
              </div>
              <div className="col-md-6">
                <label for="cedula" className="form-label">
                  RIF:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rif"
                  defaultValue={action === 1 ? "" : rif}
                  value={rif}
                  onChange={validarRif}
                  required
                  // maxLength={8}
                  //minLength={8}
                />
              </div>
              <div className="col-md-6">
                <label for="telefono" className="form-label">
                  Teléfono:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="telefono"
                  defaultValue={action === 1 ? "" : telefono}
                  value={telefono}
                  onChange={validarTelefono}
                  required
                />
              </div>
              <div className="col-md-6">
                <label for="correo" className="form-label">
                  Correo:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="correo"
                  defaultValue={action === 1 ? "" : correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  required
                />
              </div>
              <div className="col-md-12">
                <label for="direccion" className="form-label">
                  Dirección:
                </label>
                <textarea
                  className="form-control"
                  id="direccion"
                  defaultValue={action === 1 ? "" : direccion}
                  value={direccion}
                  onChange={(event) => setDireccion(event.target.value)}
                ></textarea>
              </div>
            </div>
            {/* <!--<button type="submit" className="btn btn-primary mt-3">Agregar</button>--> */}
           
              <button
                id="agregar"
                type="button"
                onClick={() =>
                  agregarProveedor(
                    "https://sysprop-production.up.railway.app/proveedores",
                    nombre,
                    rif,
                    telefono,
                    direccion,
                    correo
                  )
                }
                className="btn btn-primary"
              >
                Agregar
              </button>
            
          </form>
          <button
            id="cerrar"
            type="button"
            className="btn btn-secondary"
            data-bs-dismiss="modal"
            onClick={handleClose}
          >
            Cerrar
          </button>
        </Modal.Body>
      </Modal>
      </div>
    </>
  );
}

export default Ventas
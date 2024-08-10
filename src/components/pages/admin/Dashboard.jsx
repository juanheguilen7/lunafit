/* eslint-disable no-unused-vars */
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct, updateProduct } from '../../../redux/productsSlice';
import './Dashboard.css';
import Spinner from '../../Spinner/Spinner';
import EditIcon from '../../../assets/icons/edit.svg';
import DeleteIcon from '../../../assets/icons/delete.svg';
import NavAdmin from './NavAdmin';
import ModalComponent from './ModalComponent';
import EditComponent from './EditComponent';

const Dashboard = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const productStatus = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);
  const totalPages = useSelector((state) => state.products.totalPages);
  const currentPage = useSelector((state) => state.products.currentPage);

  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    offer: '',
    sizes: [],
    image: '',
    imageOne: '',
    imageTwo: ''
  });

  const [page, setPage] = useState(currentPage);
  const [filters, setFilters] = useState({
    category: [], // Puedes ajustar estos valores según tus filtros
    size: []
  });

  useEffect(() => {
    dispatch(fetchProducts({ page, filters }));
  }, [dispatch, page, filters]);

  const handleDelete = (productId) => {
    setProductToDelete(productId);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    dispatch(deleteProduct(productToDelete))
      .unwrap()
      .then(() => {
        setShowConfirm(false);
        setProductToDelete(null);
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
        setShowConfirm(false);
        setProductToDelete(null);
      });
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setProductToDelete(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditedProduct({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      offer: product.offer || '',
      sizes: product.sizes || [],  // Adjusted to handle sizes array
      image: product.image || '',
      imageOne: product.imageOne || '',
      imageTwo: product.imageTwo || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sizes') {
      // Convert sizes input to array format
      const sizesArray = value.split('\n').map(line => {
        const [size, stock] = line.split(',').map(part => part.trim());
        return { size, stock: Number(stock) || 0 }; // Convert stock to number
      });
      setEditedProduct({ ...editedProduct, sizes: sizesArray });
    } else {
      setEditedProduct({ ...editedProduct, [name]: value });
    }
  };

  const handleEditSubmit = (productId) => {
    const updatedProduct = {
      ...editedProduct,
      sizes: editedProduct.sizes.map(sizeObj => ({
        size: sizeObj.size,
        stock: sizeObj.stock
      }))
    };

    dispatch(updateProduct({ id: productId, ...updatedProduct }))
      .unwrap()
      .then(() => {
        setEditingProduct(null);
        dispatch(fetchProducts({ page, filters }));
      })
      .catch((error) => {
        console.error('Error updating product:', error.message);
      });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="dashboard-container">
      <NavAdmin />
      {productStatus === 'loading' && <Spinner />}
      {productStatus === 'succeeded' && (
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-item">
              <div className="product-content">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h5 className="product-name">{product.name}</h5>
                  <p className="product-price">Precio: <b>${product.price}</b></p>
                  <p className="product-stock">Stock: <b>{product.sizes.reduce((acc, size) => acc + size.stock, 0)}</b></p>
                  <p>Descuento: <b>{product.offer}</b></p>
                  <div className='product-size'>
                    <p>Talles:</p>
                    <div className='sizes'>
                      {product.sizes.map((sizeObj, index) => (
                        <div key={index}>
                          <span><b>{sizeObj.size}</b>: {sizeObj.stock}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    onClick={() => handleEdit(product)}
                    className="btn"
                  >
                    <img src={EditIcon} alt="Edit" className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="btn"
                  >
                    <img src={DeleteIcon} alt="Delete" className="icon" />
                  </button>
                </div>
              </div>
              {editingProduct === product._id && (
                <EditComponent
                  producto={product}
                  editedProducto={editedProduct}
                  handleEditChange={handleEditChange}
                  handleEditSubmit={() => handleEditSubmit(product._id)}
                  setEditingProduct={setEditingProduct}
                />
              )}
            </div>
          ))}
          <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Siguiente</button>
          </div>
        </div>
      )}
      {productStatus === 'failed' && <div>{error}</div>}
      {showConfirm && (
        <ModalComponent cancelDelete={cancelDelete} confirmDelete={confirmDelete} />
      )}
    </div>
  );
};

export default Dashboard;

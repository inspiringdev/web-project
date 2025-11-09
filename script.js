// Recipe data structure
let recipes = [];
let editingId = null;
let currentPage = 1;
const recipesPerPage = 6;

// Initialize app
function init() {
    loadRecipes();
    displayRecipes();
    setupEventListeners();
}

// Load recipes from localStorage
function loadRecipes() {
    const stored = localStorage.getItem('recipes');
    if (stored) {
        recipes = JSON.parse(stored);
    } else {
        // Add sample recipes if none exist
        recipes = [
            {
                id: Date.now(),
                title: "Classic Chocolate Chip Cookies",
                ingredients: "2 cups all-purpose flour\n1 cup butter, softened\n3/4 cup sugar\n2 eggs\n2 cups chocolate chips\n1 tsp vanilla extract\n1 tsp baking soda\n1/2 tsp salt",
                instructions: "1. Preheat oven to 375°F (190°C).\n2. Cream together butter and sugar until fluffy.\n3. Beat in eggs and vanilla.\n4. Mix in flour, baking soda, and salt.\n5. Stir in chocolate chips.\n6. Drop spoonfuls onto baking sheet.\n7. Bake for 9-11 minutes until golden brown.\n8. Cool on wire rack and enjoy!",
                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f4a460' width='400' height='300'/%3E%3Ccircle cx='200' cy='150' r='60' fill='%238b4513'/%3E%3Ccircle cx='170' cy='130' r='8' fill='%23654321'/%3E%3Ccircle cx='210' cy='140' r='8' fill='%23654321'/%3E%3Ccircle cx='190' cy='170' r='8' fill='%23654321'/%3E%3Ccircle cx='225' cy='165' r='8' fill='%23654321'/%3E%3C/svg%3E"
            }
        ];
        saveRecipes();
    }
}

// Save recipes to localStorage
function saveRecipes() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// Display recipes with pagination
function displayRecipes(filteredRecipes = null) {
    const container = document.getElementById('recipesContainer');
    const displayData = filteredRecipes || recipes;
    
    if (displayData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No recipes found</h2>
                <p>Start by adding your first recipe!</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(displayData.length / recipesPerPage);
    const startIndex = (currentPage - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    const currentRecipes = displayData.slice(startIndex, endIndex);

    container.innerHTML = currentRecipes.map(recipe => `
        <div class="recipe-card">
            <img src="${recipe.image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23667eea\' width=\'400\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'40\' fill=\'white\' text-anchor=\'middle\' dy=\'.3em\'%3E🍽️%3C/text%3E%3C/svg%3E'}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-ingredients">${recipe.ingredients.split('\n').slice(0, 3).join(', ')}${recipe.ingredients.split('\n').length > 3 ? '...' : ''}</p>
                <div class="recipe-actions">
                    <button class="btn-small btn-view" onclick="viewRecipe(${recipe.id})">View</button>
                    <button class="btn-small btn-edit" onclick="editRecipe(${recipe.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteRecipe(${recipe.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    displayPagination(totalPages);
}

// Display pagination controls
function displayPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(recipes.length / recipesPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayRecipes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    currentPage = 1;
    
    if (!searchTerm) {
        displayRecipes();
        return;
    }

    const filtered = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.toLowerCase().includes(searchTerm)
    );
    
    displayRecipes(filtered);
}

// Open add modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Recipe';
    document.getElementById('recipeForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('recipeModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('recipeModal').classList.remove('active');
    document.getElementById('recipeForm').reset();
    clearErrors();
}

// Close view modal
function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

// Preview image
function previewImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('imagePreview').innerHTML = 
                `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Validate form
function validateForm() {
    let isValid = true;
    clearErrors();

    const title = document.getElementById('title');
    const ingredients = document.getElementById('ingredients');
    const instructions = document.getElementById('instructions');

    if (!title.value.trim()) {
        showError('title', 'titleError');
        isValid = false;
    }

    if (!ingredients.value.trim()) {
        showError('ingredients', 'ingredientsError');
        isValid = false;
    }

    if (!instructions.value.trim()) {
        showError('instructions', 'instructionsError');
        isValid = false;
    }

    return isValid;
}

function showError(fieldId, errorId) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById(errorId).style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
}

// Handle form submit
function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData(e.target);
    const imageFile = document.getElementById('image').files[0];

    const recipe = {
        id: editingId || Date.now(),
        title: formData.get('title'),
        ingredients: formData.get('ingredients'),
        instructions: formData.get('instructions'),
        image: null
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            recipe.image = event.target.result;
            saveRecipeData(recipe);
        };
        reader.readAsDataURL(imageFile);
    } else {
        if (editingId) {
            const existingRecipe = recipes.find(r => r.id === editingId);
            recipe.image = existingRecipe.image;
        }
        saveRecipeData(recipe);
    }
}

function saveRecipeData(recipe) {
    if (editingId) {
        const index = recipes.findIndex(r => r.id === editingId);
        recipes[index] = recipe;
    } else {
        recipes.unshift(recipe);
    }

    saveRecipes();
    displayRecipes();
    closeModal();
}

// View recipe
function viewRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    document.getElementById('viewTitle').textContent = recipe.title;
    document.getElementById('viewContent').innerHTML = `
        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;">` : ''}
        <h3 style="color: #667eea; margin-bottom: 10px;">Ingredients</h3>
        <p style="white-space: pre-line; margin-bottom: 20px; line-height: 1.6;">${recipe.ingredients}</p>
        <h3 style="color: #667eea; margin-bottom: 10px;">Instructions</h3>
        <p style="white-space: pre-line; line-height: 1.8;">${recipe.instructions}</p>
    `;
    document.getElementById('viewModal').classList.add('active');
}

// Edit recipe
function editRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Recipe';
    document.getElementById('title').value = recipe.title;
    document.getElementById('ingredients').value = recipe.ingredients;
    document.getElementById('instructions').value = recipe.instructions;
    
    if (recipe.image) {
        document.getElementById('imagePreview').innerHTML = 
            `<img src="${recipe.image}" alt="Preview">`;
    }

    document.getElementById('recipeModal').classList.add('active');
}

// Delete recipe
function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        recipes = recipes.filter(r => r.id !== id);
        saveRecipes();
        
        // Adjust current page if needed
        const totalPages = Math.ceil(recipes.length / recipesPerPage);
        if (currentPage > totalPages && currentPage > 1) {
            currentPage = totalPages;
        }
        
        displayRecipes();
    }
}

// Initialize app on load
init();
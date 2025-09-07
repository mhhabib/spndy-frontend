import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useApiClient } from '@/utils/apiClient';

export interface Category {
	id: string;
	name: string;
}

const CategoryManagement = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [editCategory, setEditCategory] = useState<Category | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const { toast } = useToast();
	const apiClient = useApiClient();

	const isEditModeOn = localStorage.getItem('editMode') === 'true';

	useEffect(() => {
		fetchCategories();
	}, []);

	// Fetch categories from API
	const fetchCategories = async () => {
		try {
			const data = await apiClient.get('/categories');
			const sortedCategories = data.sort((a: Category, b: Category) =>
				a.name.localeCompare(b.name)
			);
			setCategories(sortedCategories);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	// Add new category
	const handleAddCategory = async () => {
		if (!newCategoryName.trim()) return;

		try {
			const newCategory = await apiClient.post('/categories', {
				name: newCategoryName.trim(),
			});

			const sortedCategories = [...categories, newCategory].sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			setCategories(sortedCategories);
			setNewCategoryName('');
			setIsAddDialogOpen(false);

			toast({
				title: 'Category added',
				description: `${newCategory.name} has been added to your categories.`,
			});
		} catch (error) {
			console.error('Error adding category:', error);
			toast({
				title: 'Error',
				description: 'Failed to add category. Please try again.',
				variant: 'destructive',
			});
		}
	};

	// Edit category
	const handleEditCategory = async () => {
		if (!editCategory || !editCategory.name.trim()) return;

		try {
			await apiClient.put(`/categories/${editCategory.id}`, {
				name: editCategory.name.trim(),
			});

			const sortedCategories = categories
				.map((cat) =>
					cat.id === editCategory.id ? { ...cat, name: editCategory.name } : cat
				)
				.sort((a, b) => a.name.localeCompare(b.name));

			setCategories(sortedCategories);
			setIsEditDialogOpen(false);

			toast({
				title: 'Category updated',
				description: 'Category has been successfully updated.',
			});
		} catch (error) {
			console.error('Error updating category:', error);
			toast({
				title: 'Error',
				description: 'Failed to update category. Please try again.',
				variant: 'destructive',
			});
		}
	};

	// Delete category
	const handleDeleteCategory = async () => {
		if (!deleteId) return;

		try {
			await apiClient.del(`/categories/${deleteId}`);
			setCategories(categories.filter((cat) => cat.id !== deleteId));
			setIsDeleteDialogOpen(false);

			toast({
				title: 'Category deleted',
				description: 'The category has been successfully deleted.',
			});
		} catch (error: any) {
			// Handle 400 error separately if apiClient throws it
			if (error.status === 400) {
				setIsDeleteDialogOpen(false);
				toast({
					title: 'Deletion Not Allowed',
					description:
						error.data?.message ||
						'This category is linked to existing expense and cannot be deleted. Please remove or reassign the expenses before deleting the category.',
					variant: 'destructive',
				});
				return;
			}

			console.error('Error deleting category:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while deleting the category.',
				variant: 'destructive',
			});
		}
	};

	const openEditDialog = (category: Category) => {
		setEditCategory(category);
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (id: string) => {
		setDeleteId(id);
		setIsDeleteDialogOpen(true);
	};

	return (
		<Card className="card-glass w-full animate-fade-in">
			<CardHeader className="pb-2 flex flex-row justify-between items-center">
				<CardTitle className="text-lg font-medium">
					Category Management
				</CardTitle>

				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="flex items-center gap-1">
							<Plus className="h-4 w-4" />
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add New Category</DialogTitle>
							<DialogDescription>
								Enter a name for the new expense category.
							</DialogDescription>
						</DialogHeader>

						<div className="mt-4 mb-4">
							<Input
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								placeholder="Category name"
							/>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsAddDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleAddCategory}
								disabled={!newCategoryName.trim()}
							>
								Add Category
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardHeader>

			<CardContent>
				<div className="relative overflow-x-auto rounded-lg">
					<table className="w-full text-sm text-left">
						<thead className="text-xs uppercase bg-muted/30 backdrop-blur-sm">
							<tr>
								<th scope="col" className="px-4 py-3">
									Category Name
								</th>
								{isEditModeOn && (
									<th scope="col" className="px-4 py-3 text-right">
										Actions
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{categories.map((category) => (
								<tr
									key={category.id}
									className="category-item border-b border-border/40 bg-white/30 backdrop-blur-sm last:border-0"
								>
									<td className="px-4 py-3">
										<p className="font-medium">{category.name}</p>
									</td>
									{isEditModeOn && (
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-2">
												<Dialog
													open={
														isEditDialogOpen && editCategory?.id === category.id
													}
													onOpenChange={setIsEditDialogOpen}
												>
													<DialogTrigger asChild>
														<Button
															size="icon"
															variant="ghost"
															className="h-8 w-8"
															onClick={() => openEditDialog(category)}
														>
															<Edit className="h-4 w-4" />
															<span className="sr-only">Edit</span>
														</Button>
													</DialogTrigger>
													<DialogContent className="sm:max-w-[425px]">
														<DialogHeader>
															<DialogTitle>Edit Category</DialogTitle>
															<DialogDescription>
																Update the name of the category.
															</DialogDescription>
														</DialogHeader>

														<div className="mt-4 mb-4">
															<Input
																value={editCategory?.name || ''}
																onChange={(e) =>
																	setEditCategory(
																		editCategory
																			? {
																					...editCategory,
																					name: e.target.value,
																			  }
																			: null
																	)
																}
																placeholder="Category name"
															/>
														</div>

														<DialogFooter>
															<Button
																variant="outline"
																onClick={() => setIsEditDialogOpen(false)}
															>
																Cancel
															</Button>
															<Button
																onClick={handleEditCategory}
																disabled={!editCategory?.name.trim()}
															>
																Save Changes
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>

												<Dialog
													open={isDeleteDialogOpen && deleteId === category.id}
													onOpenChange={setIsDeleteDialogOpen}
												>
													<DialogTrigger asChild>
														<Button
															size="icon"
															variant="ghost"
															className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
															onClick={() => openDeleteDialog(category.id)}
														>
															<Trash className="h-4 w-4" />
															<span className="sr-only">Delete</span>
														</Button>
													</DialogTrigger>
													<DialogContent className="sm:max-w-[425px]">
														<DialogHeader>
															<DialogTitle>Confirm Deletion</DialogTitle>
															<DialogDescription>
																Are you sure you want to delete this category?
																This action cannot be undone.
															</DialogDescription>
														</DialogHeader>
														<DialogFooter>
															<Button
																variant="outline"
																onClick={() => setIsDeleteDialogOpen(false)}
															>
																Cancel
															</Button>
															<Button
																variant="destructive"
																onClick={handleDeleteCategory}
															>
																Delete
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</div>
										</td>
									)}
								</tr>
							))}
							{categories.length === 0 && (
								<tr className="border-b border-border/40 bg-white/30 backdrop-blur-sm">
									<td
										colSpan={2}
										className="px-4 py-10 text-center text-muted-foreground"
									>
										No categories found. Add your first category to get started.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
};

export default CategoryManagement;

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

	const fetchCategories = async () => {
		try {
			const data = await apiClient.get('/categories');
			const sorted = data.sort((a: Category, b: Category) =>
				a.name.localeCompare(b.name)
			);
			setCategories(sorted);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	const handleAddCategory = async () => {
		if (!newCategoryName.trim()) return;
		try {
			const newCat = await apiClient.post('/categories', {
				name: newCategoryName.trim(),
			});
			const sorted = [...categories, newCat].sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			setCategories(sorted);
			setNewCategoryName('');
			setIsAddDialogOpen(false);
			toast({
				title: 'Category added',
				description: `${newCat.name} has been added.`,
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add category.',
				variant: 'destructive',
			});
		}
	};

	const handleEditCategory = async () => {
		if (!editCategory || !editCategory.name.trim()) return;
		try {
			await apiClient.put(`/categories/${editCategory.id}`, {
				name: editCategory.name.trim(),
			});
			const sorted = categories
				.map((c) =>
					c.id === editCategory.id ? { ...c, name: editCategory.name } : c
				)
				.sort((a, b) => a.name.localeCompare(b.name));
			setCategories(sorted);
			setIsEditDialogOpen(false);
			toast({
				title: 'Category updated',
				description: 'Category successfully updated.',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update category.',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteCategory = async () => {
		if (!deleteId) return;
		try {
			await apiClient.del(`/categories/${deleteId}`);
			setCategories(categories.filter((c) => c.id !== deleteId));
			setIsDeleteDialogOpen(false);
			toast({
				title: 'Category deleted',
				description: 'Category successfully deleted.',
			});
		} catch (error: any) {
			if (error.status === 400) {
				toast({
					title: 'Deletion Not Allowed',
					description:
						error.data?.message ||
						'This category is linked to existing expenses.',
					variant: 'destructive',
				});
			} else {
				toast({
					title: 'Error',
					description: 'An error occurred during deletion.',
					variant: 'destructive',
				});
			}
		}
	};

	const openEditDialog = (cat: Category) => {
		setEditCategory(cat);
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (id: string) => {
		setDeleteId(id);
		setIsDeleteDialogOpen(true);
	};

	return (
		<Card className="card-glass w-full animate-fade-in bg-background text-foreground border border-border shadow-sm">
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
					<DialogContent className="sm:max-w-[425px] bg-background text-foreground">
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
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardHeader>

			<CardContent>
				<div className="relative overflow-x-auto rounded-lg border border-border/40">
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
									className="border-b border-border/40 bg-background/50 backdrop-blur-sm hover:bg-muted/30 transition-colors"
								>
									<td className="px-4 py-3">
										<p className="font-medium">{category.name}</p>
									</td>
									{isEditModeOn && (
										<td className="px-4 py-3 text-right whitespace-nowrap">
											<div className="flex justify-end gap-2">
												{/* Edit */}
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
													<DialogContent className="sm:max-w-[425px] bg-background text-foreground">
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
																Save
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>

												{/* Delete */}
												<Dialog
													open={isDeleteDialogOpen && deleteId === category.id}
													onOpenChange={setIsDeleteDialogOpen}
												>
													<DialogTrigger asChild>
														<Button
															size="icon"
															variant="ghost"
															className="h-8 w-8 text-destructive hover:bg-destructive/20"
															onClick={() => openDeleteDialog(category.id)}
														>
															<Trash className="h-4 w-4" />
															<span className="sr-only">Delete</span>
														</Button>
													</DialogTrigger>
													<DialogContent className="sm:max-w-[425px] bg-background text-foreground">
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
								<tr className="border-b border-border/40 bg-background/50 backdrop-blur-sm">
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

export type Visibility = 'private'|'friends'|'selected'|'public'
export interface Ingredient { id?:string; position:number; quantity:number|null; unit:string; name:string; notes:string }
export interface Step { id?:string; position:number; instruction:string }
export interface Recipe {
 id:string; owner_id:string; title:string; description:string|null; category:string;
 servings:number; prep_minutes:number; cook_minutes:number; visibility:Visibility;
 cover_image_path:string|null; created_at:string; updated_at:string
}
export interface RecipeDraft {
 title:string;description:string;category:string;servings:number;prep_minutes:number;cook_minutes:number;
 visibility:Visibility;ingredients:Ingredient[];steps:Step[]
}

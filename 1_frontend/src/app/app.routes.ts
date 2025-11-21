import { RouterModule } from '@angular/router';

import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: Home }, // ruta raíz
    { path: 'login', component: Login }, // ruta login
    { path: 'profile', canActivate: [authGuard], component: Profile }, // ruta perfil
];

 @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutesModule { }
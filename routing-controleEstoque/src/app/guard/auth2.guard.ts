import { inject } from "@angular/core";
import { CanActivateFn, Router, Routes, Route, UrlSegment, CanMatchFn} from "@angular/router";
import { LoginService } from "../AuthService/login.service";

export const authGuard: CanActivateFn = (route, state ) =>{
    const loginService = inject(LoginService);
    const router = inject(Router);

  if(loginService.isLoggedIn()){
    return true;
  }else{
    const url = router.createUrlTree(['/login']);
    return url;
  }
}

export const authGuardMatch: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const loginService = inject(LoginService);
  return loginService.isLoggedIn();
};